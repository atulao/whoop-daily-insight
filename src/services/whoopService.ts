import axios from 'axios';

// WHOOP API constants
const WHOOP_API_BASE_URL = 'https://api.prod.whoop.com/developer';
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';

// Types for WHOOP API responses
export interface WhoopUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface WhoopRecovery {
  score: number;
  restingHeartRate: number;
  hrvMs: number;
  date: string;
}

export interface WhoopStrain {
  score: number;
  averageHeartRate: number;
  maxHeartRate: number;
  kilojoules: number;
  date: string;
}

export interface WhoopSleep {
  id: string;
  state: string;
  scoreState: string;
  qualityDuration: number;
  respiratoryRate: number;
  sleepNeed: number;
  date: string;
}

// Configuration and authentication
export interface WhoopConfig {
  clientId: string;
  redirectUri: string;
}

export interface WhoopAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Store config in localStorage keys
const CLIENT_ID_KEY = 'whoopConfig_clientId';

// Function to load config from localStorage
function loadConfigFromLocalStorage(): WhoopConfig {
  const clientId = localStorage.getItem(CLIENT_ID_KEY) || 'whoop-client-id-placeholder';
  return {
    clientId: clientId,
    redirectUri: window.location.origin + '/connect',
  };
}

interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export class WhoopService {
  private config: WhoopConfig;
  private authState: WhoopAuthState = {
    isAuthenticated: false
  };

  constructor() { // Remove default config parameter
    this.config = loadConfigFromLocalStorage(); // Load from localStorage
    this.loadAuthStateFromLocalStorage();
  }

  // Load authentication state from localStorage
  private loadAuthStateFromLocalStorage() {
    const storedState = localStorage.getItem('whoopAuthState');
    if (storedState) {
      this.authState = JSON.parse(storedState);
      
      // Check if token has expired
      if (this.authState.expiresAt && this.authState.expiresAt < Date.now()) {
        console.log('WHOOP token expired, attempting refresh...');
        // Attempt refresh instead of immediate logout
        this.refreshToken().catch(error => {
          console.error('Failed to refresh token on load:', error);
          this.logout();
        });
      }
    }
  }

  // Save authentication state to localStorage
  private saveAuthStateToLocalStorage() {
    localStorage.setItem('whoopAuthState', JSON.stringify(this.authState));
  }

  // Get authentication status
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Allow setting client ID at runtime
  public setClientId(clientId: string): boolean {
    if (clientId && clientId.trim() !== '') {
      this.config.clientId = clientId.trim();
      localStorage.setItem(CLIENT_ID_KEY, this.config.clientId); // Save to localStorage
      return true;
    }
    return false;
  }

  // Get the current client ID
  public getClientId(): string {
    return this.config.clientId;
  }

  // Generate a random string for PKCE
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values).map(x => possible[x % possible.length]).join('');
  }

  // Generate SHA-256 hash
  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }

  // Base64URL encode
  private base64URLEncode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Generate PKCE challenge
  private async generatePKCEChallenge(): Promise<PKCEChallenge> {
    const codeVerifier = this.generateRandomString(128);
    const state = this.generateRandomString(32);
    const hashed = await this.sha256(codeVerifier);
    const codeChallenge = this.base64URLEncode(hashed);
    
    // Store PKCE values in localStorage
    localStorage.setItem('pkce_verifier', codeVerifier);
    localStorage.setItem('pkce_state', state);
    
    return { codeVerifier, codeChallenge, state };
  }

  // Get login URL with PKCE
  public async getLoginUrl(): Promise<string> {
    if (!this.config.clientId || this.config.clientId === 'whoop-client-id-placeholder') {
      throw new Error('WHOOP Client ID not configured. Please set a valid client ID.');
    }
    
    const { codeChallenge, state } = await this.generatePKCEChallenge();
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read:profile read:recovery read:cycles read:workout read:sleep',
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state
    });

    return `${WHOOP_AUTH_URL}?${params.toString()}`;
  }

  // Handle authentication callback with PKCE verification
  public async handleAuthCallback(code: string): Promise<boolean> {
    const storedVerifier = localStorage.getItem('pkce_verifier');
    const storedState = localStorage.getItem('pkce_state');
    const urlParams = new URLSearchParams(window.location.search);
    const returnedState = urlParams.get('state');

    // Verify state parameter to prevent CSRF
    if (!storedState || !returnedState || storedState !== returnedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      const response = await axios.post(WHOOP_TOKEN_URL, {
        client_id: this.config.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        code_verifier: storedVerifier
      });

      this.authState = {
        isAuthenticated: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + response.data.expires_in * 1000,
      };

      this.saveAuthStateToLocalStorage();
      
      // Clean up PKCE values
      localStorage.removeItem('pkce_verifier');
      localStorage.removeItem('pkce_state');
      
      return true;
    } catch (error) {
      console.error('Failed to authenticate with WHOOP:', error);
      // Clean up PKCE values even on failure
      localStorage.removeItem('pkce_verifier');
      localStorage.removeItem('pkce_state');
      return false;
    }
  }

  // Refresh token
  private async refreshToken(): Promise<void> {
    if (!this.authState.refreshToken) {
      console.error('No refresh token available.');
      this.logout();
      throw new Error('No refresh token available.');
    }

    try {
      const response = await axios.post(WHOOP_TOKEN_URL, {
        grant_type: 'refresh_token',
        refresh_token: this.authState.refreshToken,
        client_id: this.config.clientId, // Client ID might be required by WHOOP
      });

      this.authState = {
        ...this.authState,
        isAuthenticated: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || this.authState.refreshToken, // Keep old if new one isn't provided
        expiresAt: Date.now() + response.data.expires_in * 1000,
      };

      this.saveAuthStateToLocalStorage();
      console.log('WHOOP token refreshed successfully.');
    } catch (error) {
      console.error('Failed to refresh WHOOP token:', error);
      this.logout(); // Logout if refresh fails
      throw error; // Re-throw error
    }
  }

  // Log out
  public logout() {
    this.authState = { isAuthenticated: false };
    localStorage.removeItem('whoopAuthState');
  }

  // API request helper
  private async apiRequest<T>(endpoint: string): Promise<T> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with WHOOP');
    }

    // Check for expiration before making request
    if (this.authState.expiresAt && this.authState.expiresAt < Date.now()) {
      console.log('Token expired before request, attempting refresh...');
      try {
        await this.refreshToken();
      } catch (refreshError) {
        throw new Error('Session expired. Please login again.');
      }
    }

    try {
      const response = await axios.get(`${WHOOP_API_BASE_URL}${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${this.authState.accessToken}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('WHOOP API request failed:', error);
      // Check for 401 Unauthorized error and attempt refresh
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Received 401, attempting token refresh...');
        try {
          await this.refreshToken();
          // Retry the original request with the new token
          console.log('Retrying API request after refresh...');
          const retryResponse = await axios.get(`${WHOOP_API_BASE_URL}${endpoint}`, {
            headers: { 
              'Authorization': `Bearer ${this.authState.accessToken}` 
            }
          });
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Token refresh failed after 401:', refreshError);
          this.logout(); // Log out if refresh fails
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error; // Re-throw other errors
    }
  }

  // Get user profile
  public async getProfile(): Promise<WhoopUser> {
    return this.apiRequest<WhoopUser>('/v1/user/profile');
  }

  // Get recent recovery data
  public async getRecovery(days: number = 7): Promise<WhoopRecovery[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    return this.apiRequest<WhoopRecovery[]>(`/v1/recovery?start=${start}&end=${end}`);
  }

  // Get recent strain data
  public async getStrain(days: number = 7): Promise<WhoopStrain[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    return this.apiRequest<WhoopStrain[]>(`/v1/cycle?start=${start}&end=${end}`);
  }

  // Get recent sleep data
  public async getSleep(days: number = 7): Promise<WhoopSleep[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    
    return this.apiRequest<WhoopSleep[]>(`/v1/sleep?start=${start}&end=${end}`);
  }
}

// Create and export a singleton instance
export const whoopService = new WhoopService();
