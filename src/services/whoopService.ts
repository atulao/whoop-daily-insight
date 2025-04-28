import axios from 'axios';

// WHOOP API constants
const WHOOP_API_BASE_URL = 'https://api.prod.whoop.com/developer';
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
// Define the proxy paths
const PROXIED_WHOOP_TOKEN_URL = '/oauth-proxy/oauth/oauth2/token';
const PROXIED_WHOOP_API_BASE_URL = '/oauth-proxy/developer';

// Debug flags
const DEBUG_MODE = true;

// Types for WHOOP API responses
export interface WhoopUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  score_state: string;
  score?: {
    user_calibrating: boolean;
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
}

export interface WhoopStrain {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  score_state: string;
  score?: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
    max_heart_rate: number;
  };
}

export interface WhoopSleep {
  id: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  start: string;
  end: string;
  timezone_offset: string;
  nap: boolean;
  score_state: string;
  score?: {
    stage_summary: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
      total_light_sleep_time_milli: number;
      total_slow_wave_sleep_time_milli: number;
      total_rem_sleep_time_milli: number;
      sleep_cycle_count: number;
      disturbance_count: number;
    };
    sleep_needed: {
      baseline_milli: number;
      need_from_sleep_debt_milli: number;
      need_from_recent_strain_milli: number;
      need_from_recent_nap_milli: number;
    };
    respiratory_rate: number;
    sleep_performance_percentage: number;
    sleep_consistency_percentage: number;
    sleep_efficiency_percentage: number;
  };
}

// Configuration and authentication
export interface WhoopConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface WhoopAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Store config in localStorage keys
// const CLIENT_ID_KEY = 'whoopConfig_clientId'; // No longer needed

// Function to load config from environment variables
function loadConfigFromEnv(): WhoopConfig {
  const clientId = import.meta.env.VITE_WHOOP_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_WHOOP_CLIENT_SECRET;
  
  if (!clientId || clientId === 'your_actual_whoop_client_id_here' || clientId === 'whoop-client-id-placeholder') {
    // Add a check or warning if the env var isn't set properly
    console.warn(
      'WARNING: VITE_WHOOP_CLIENT_ID is not set correctly in your .env file. \n' + 
      'Please create a .env file in the project root and add VITE_WHOOP_CLIENT_ID=your_client_id.'
    );
  }
  
  if (!clientSecret) {
    console.warn(
      'WARNING: VITE_WHOOP_CLIENT_SECRET is not set in your .env file. \n' + 
      'Please add VITE_WHOOP_CLIENT_SECRET=your_client_secret to your .env file.'
    );
  }
  
  // Log the redirect URI being used
  const redirectUri = typeof window !== 'undefined' ? window.location.origin + '/connect' : 'http://localhost:8080/connect';
  console.log('[DEBUG] Using redirect URI:', redirectUri);
  
  return {
    clientId: clientId || 'env-error-placeholder',
    clientSecret: clientSecret || '',
    redirectUri,
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

  constructor() {
    this.config = loadConfigFromEnv(); // Load from environment
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
    // Check if the clientId indicates it hasn't been set correctly
    if (!this.config.clientId || this.config.clientId === 'env-error-placeholder') {
      throw new Error(
        'WHOOP Client ID not configured. ' + 
        'Please set VITE_WHOOP_CLIENT_ID in your .env file and restart the development server.'
      );
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
        console.error('[ERROR] Invalid state parameter during auth callback.');
        console.error('[DEBUG] Stored state:', storedState);
        console.error('[DEBUG] Returned state:', returnedState);
        // Clean up potentially compromised PKCE values
        localStorage.removeItem('pkce_verifier');
        localStorage.removeItem('pkce_state');
        throw new Error('Invalid state parameter');
    }

    try {
      // --- Format data as x-www-form-urlencoded --- 
      const params = new URLSearchParams();
      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', this.config.redirectUri);
      params.append('code_verifier', storedVerifier || ''); // Ensure non-null
      
      // --- Add enhanced logging --- 
      console.log('[DEBUG] Token exchange attempt details:');
      console.log('[DEBUG] Client ID:', this.config.clientId);
      console.log('[DEBUG] Client Secret provided:', !!this.config.clientSecret);
      console.log('[DEBUG] Grant type: authorization_code');
      console.log('[DEBUG] Code length:', code.length);
      console.log('[DEBUG] Redirect URI:', this.config.redirectUri);
      console.log('[DEBUG] Code verifier length:', (storedVerifier || '').length);
      console.log('[DEBUG] Proxy URL:', PROXIED_WHOOP_TOKEN_URL);
      console.log('[DEBUG] Full params being sent:', params.toString().replace(this.config.clientSecret, '[REDACTED]'));
      // --- End enhanced logging --- 

      const response = await axios.post(
        // --- Use PROXIED URL --- 
        PROXIED_WHOOP_TOKEN_URL, 
        // --- End change --- 
        params, 
        { // Explicitly set Content-Type header
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // --- Log successful response ---
      console.log('[DEBUG] Token exchange successful. Response:', response.status);
      // --- End logging ---

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
      // --- Add enhanced error logging for error response data --- 
      if (axios.isAxiosError(error)) {
        console.error('[ERROR] Axios error during token exchange:');
        console.error('  Status:', error.response?.status);
        console.error('  Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('  Headers:', JSON.stringify(error.response?.headers, null, 2));
        
        // Check if CORS is the issue
        if (error.message.includes('CORS')) {
          console.error('[ERROR] CORS error detected. Make sure the proxy is set up correctly in vite.config.ts.');
        }
      }
      // --- End enhanced logging --- 
      console.error('[ERROR] Failed to authenticate with WHOOP:', error);
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
      // --- Format data as x-www-form-urlencoded --- 
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', this.authState.refreshToken);
      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);

      const response = await axios.post(PROXIED_WHOOP_TOKEN_URL, params);
      // --- End change --- 

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
      console.log(`[DEBUG] Making API request to: ${PROXIED_WHOOP_API_BASE_URL}${endpoint}`);
      
      // Print out the full URL and authorization token (partially masked)
      if (DEBUG_MODE) {
        const tokenPreview = this.authState.accessToken ? 
          `${this.authState.accessToken.substring(0, 10)}...${this.authState.accessToken.substring(this.authState.accessToken.length - 5)}` : 
          'none';
        console.log(`[DEBUG] Full request URL: ${PROXIED_WHOOP_API_BASE_URL}${endpoint}`);
        console.log(`[DEBUG] Using auth token: ${tokenPreview}`);
      }
      
      const response = await axios.get(`${PROXIED_WHOOP_API_BASE_URL}${endpoint}`, {
        headers: { 
          'Authorization': `Bearer ${this.authState.accessToken}` 
        }
      });
      
      // Log successful response summary
      if (DEBUG_MODE) {
        // Log the structure of the response without all the data
        const responsePreview = { 
          status: response.status,
          hasData: !!response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          recordCount: response.data?.records ? response.data.records.length : 'N/A'
        };
        console.log(`[DEBUG] API response summary:`, responsePreview);
      }
      
      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('[ERROR] WHOOP API request failed:', endpoint);
      
      if (axios.isAxiosError(error)) {
        // Log more details about the error
        console.error(`[ERROR] Status: ${error.response?.status}`);
        console.error(`[ERROR] Status text: ${error.response?.statusText}`);
        console.error(`[ERROR] Response data:`, error.response?.data);
        
        // Check for specific error conditions
        if (error.response?.status === 403) {
          console.error('[ERROR] Possible permission issue. Check that your WHOOP account has this data available and your app has the correct scopes.');
        } else if (error.response?.status === 404) {
          console.error('[ERROR] Endpoint not found. This might indicate the API has changed or the user does not have this data type available.');
        }
      } else {
        console.error('[ERROR] Non-Axios error:', error);
      }
      
      // Check for 401 Unauthorized error and attempt refresh
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Received 401, attempting token refresh...');
        try {
          await this.refreshToken();
          // Retry the original request with the new token
          console.log('Retrying API request after refresh...');
          const retryResponse = await axios.get(`${PROXIED_WHOOP_API_BASE_URL}${endpoint}`, {
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
    return this.apiRequest<WhoopUser>('/v1/user/profile/basic');
  }

  // Get recent recovery data
  public async getRecovery(days: number = 7): Promise<WhoopRecovery[]> {
    const endDate = new Date();
    // Start from beginning of current day to ensure we get today's data
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    // Request specific ordering to get most recent data first
    console.log(`[INFO] Fetching recovery data from ${start} to ${end}`);
    const response = await this.apiRequest<{records: WhoopRecovery[]}>(`/v1/recovery?start=${start}&end=${end}`);
    
    // Sort by date (most recent first) and ensure we have the latest data
    const records = response.records || [];
    records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log(`[INFO] Fetched ${records.length} recovery records`);
    
    // Extract and log the recovery scores for easier debugging
    const recoveryScores = records.map(r => ({
      date: new Date(r.created_at).toLocaleString(),
      score: r.score?.recovery_score,
      hrv: r.score?.hrv_rmssd_milli,
      hasScore: !!r.score
    }));
    console.log('[DEBUG] Recovery scores by date:', recoveryScores);
    
    return records;
  }

  // Get recent strain data
  public async getStrain(days: number = 7): Promise<WhoopStrain[]> {
    const endDate = new Date();
    // Start from beginning of current day to ensure we get today's data
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    console.log(`[INFO] Fetching strain data from ${start} to ${end}`);
    const response = await this.apiRequest<{records: WhoopStrain[]}>(`/v1/cycle?start=${start}&end=${end}`);
    
    // Sort by date (most recent first) and ensure we have the latest data
    const records = response.records || [];
    records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    console.log(`[INFO] Fetched ${records.length} strain records`);
    
    // Extract and log the strain scores for easier debugging
    const strainScores = records.map(r => ({
      date: new Date(r.created_at).toLocaleString(),
      score: r.score?.strain,
      hasScore: !!r.score
    }));
    console.log('[DEBUG] Strain scores by date:', strainScores);
    
    return records;
  }

  // Get recent sleep data
  public async getSleep(days: number = 7): Promise<WhoopSleep[]> {
    const endDate = new Date();
    // Add one day to endDate to ensure we get today's data and any pending/projected data
    endDate.setDate(endDate.getDate() + 1);
    
    // Start from beginning of current day minus requested days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    console.log(`[INFO] Fetching sleep data from ${start} to ${end}`);
    const response = await this.apiRequest<{records: WhoopSleep[]}>(`/v1/activity/sleep?start=${start}&end=${end}`);
    
    // Sort by date (most recent first) and ensure we have the latest data
    const records = response.records || [];
    records.sort((a, b) => new Date(b.end || b.created_at).getTime() - new Date(a.end || a.created_at).getTime());
    
    console.log(`[INFO] Fetched ${records.length} sleep records`);
    
    // Extract and log the sleep scores and dates for easier debugging
    const sleepDetails = records.map(r => ({
      date: new Date(r.end || r.created_at).toLocaleString(),
      created: new Date(r.created_at).toLocaleString(),
      start: r.start ? new Date(r.start).toLocaleString() : 'N/A',
      end: r.end ? new Date(r.end).toLocaleString() : 'N/A',
      performance: r.score?.sleep_performance_percentage,
      hasScore: !!r.score
    }));
    console.log('[DEBUG] Sleep records by date:', sleepDetails);
    
    return records;
  }
  
  // Force refresh all data
  public async refreshAllData(): Promise<{
    profile: WhoopUser | null,
    recovery: WhoopRecovery[] | null,
    strain: WhoopStrain[] | null,
    sleep: WhoopSleep[] | null
  }> {
    console.log('[INFO] Manually refreshing all WHOOP data');
    try {
      // Clear React Query cache or other caching mechanisms
      // Note: Implementation depends on your caching strategy
      
      // Fetch fresh data (with cache busting if needed)
      const today = new Date();
      const cacheBuster = `&_cb=${today.getTime()}`;
      
      // Make requests with fresh timestamp to bypass any caching
      const profile = await this.apiRequest<WhoopUser>(`/v1/user/profile/basic?${cacheBuster}`);
      const recovery = await this.getRecovery(7);
      const strain = await this.getStrain(7);
      const sleep = await this.getSleep(7);
      
      console.log('[INFO] Data refresh completed successfully');
      
      return {
        profile,
        recovery,
        strain,
        sleep
      };
    } catch (error) {
      console.error('[ERROR] Failed to refresh data:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const whoopService = new WhoopService();
