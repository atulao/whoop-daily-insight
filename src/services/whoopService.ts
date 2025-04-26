
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

// Initialize with your WHOOP API credentials
// Replace with your actual Client ID from the WHOOP Developer Portal
// This is a public client ID so it's okay to include in the codebase
const whoopConfig: WhoopConfig = {
  clientId: 'whoop-client-id-placeholder', // Replace this with your actual WHOOP Client ID
  redirectUri: window.location.origin + '/connect', // This should match what's registered in WHOOP Developer Portal
};

// Main WHOOP service class
export class WhoopService {
  private config: WhoopConfig;
  private authState: WhoopAuthState = {
    isAuthenticated: false
  };

  constructor(config: WhoopConfig = whoopConfig) {
    this.config = config;
    this.loadAuthStateFromLocalStorage();
  }

  // Load authentication state from localStorage
  private loadAuthStateFromLocalStorage() {
    const storedState = localStorage.getItem('whoopAuthState');
    if (storedState) {
      this.authState = JSON.parse(storedState);
      
      // Check if token has expired
      if (this.authState.expiresAt && this.authState.expiresAt < Date.now()) {
        console.log('WHOOP token expired, need to refresh');
        this.logout(); // For simplicity, just log out if expired
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
  public setClientId(clientId: string) {
    if (clientId && clientId.trim() !== '') {
      this.config.clientId = clientId;
      return true;
    }
    return false;
  }

  // Get the current client ID
  public getClientId(): string {
    return this.config.clientId;
  }

  // Get login URL
  public getLoginUrl(): string {
    if (!this.config.clientId || this.config.clientId === 'whoop-client-id-placeholder') {
      throw new Error('WHOOP Client ID not configured. Please set a valid client ID.');
    }
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read:profile read:recovery read:cycles read:workout read:sleep',
    });

    return `${WHOOP_AUTH_URL}?${params.toString()}`;
  }

  // Handle authentication callback
  public async handleAuthCallback(code: string): Promise<boolean> {
    try {
      const response = await axios.post(WHOOP_TOKEN_URL, {
        client_id: this.config.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      });

      this.authState = {
        isAuthenticated: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + response.data.expires_in * 1000,
      };

      this.saveAuthStateToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to authenticate with WHOOP:', error);
      return false;
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

    try {
      const response = await axios.get(`${WHOOP_API_BASE_URL}${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${this.authState.accessToken}` 
        }
      });
      return response.data;
    } catch (error) {
      console.error('WHOOP API request failed:', error);
      throw error;
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
