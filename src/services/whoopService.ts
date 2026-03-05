import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// WHOOP API constants
const WHOOP_API_BASE_URL = 'https://api.prod.whoop.com/developer';
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';

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

export interface WhoopAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export class WhoopService {
  private authState: WhoopAuthState = { isAuthenticated: false };
  private clientId: string | null = null;

  constructor() {
    this.loadAuthStateFromLocalStorage();
  }

  private loadAuthStateFromLocalStorage() {
    const storedState = localStorage.getItem('whoopAuthState');
    if (storedState) {
      this.authState = JSON.parse(storedState);
      if (this.authState.expiresAt && this.authState.expiresAt < Date.now()) {
        console.log('WHOOP token expired, attempting refresh...');
        this.refreshToken().catch(error => {
          console.error('Failed to refresh token on load:', error);
          this.logout();
        });
      }
    }
  }

  private saveAuthStateToLocalStorage() {
    localStorage.setItem('whoopAuthState', JSON.stringify(this.authState));
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  // Fetch client ID from backend
  private async getClientId(): Promise<string> {
    if (this.clientId) return this.clientId;

    const { data, error } = await supabase.functions.invoke("whoop-token-exchange", {
      body: { action: "get_client_id" },
    });

    if (error || data?.error) {
      throw new Error(data?.error || "Failed to fetch WHOOP configuration");
    }

    this.clientId = data.client_id;
    return data.client_id;
  }

  // Check if the backend is configured
  public async isConfigured(): Promise<boolean> {
    try {
      await this.getClientId();
      return true;
    } catch {
      return false;
    }
  }

  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values).map(x => possible[x % possible.length]).join('');
  }

  private async sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  }

  private base64URLEncode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private async generatePKCEChallenge(): Promise<PKCEChallenge> {
    const codeVerifier = this.generateRandomString(128);
    const state = this.generateRandomString(32);
    const hashed = await this.sha256(codeVerifier);
    const codeChallenge = this.base64URLEncode(hashed);
    
    localStorage.setItem('pkce_verifier', codeVerifier);
    localStorage.setItem('pkce_state', state);
    
    return { codeVerifier, codeChallenge, state };
  }

  public async getLoginUrl(): Promise<string> {
    const clientId = await this.getClientId();
    const redirectUri = window.location.origin + '/connect';
    const { codeChallenge, state } = await this.generatePKCEChallenge();
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read:profile read:recovery read:cycles read:workout read:sleep',
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state
    });

    return `${WHOOP_AUTH_URL}?${params.toString()}`;
  }

  public async handleAuthCallback(code: string): Promise<boolean> {
    const storedVerifier = localStorage.getItem('pkce_verifier');
    const storedState = localStorage.getItem('pkce_state');
    const urlParams = new URLSearchParams(window.location.search);
    const returnedState = urlParams.get('state');

    if (!storedState || !returnedState || storedState !== returnedState) {
      throw new Error('Invalid state parameter');
    }

    try {
      const { data: responseData, error: fnError } = await supabase.functions.invoke("whoop-token-exchange", {
        body: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: window.location.origin + '/connect',
          code_verifier: storedVerifier,
        },
      });

      if (fnError) {
        console.error('Token exchange edge function error:', fnError);
        localStorage.removeItem('pkce_verifier');
        localStorage.removeItem('pkce_state');
        return false;
      }

      if (responseData?.error) {
        console.error('Token exchange error:', responseData.error);
        localStorage.removeItem('pkce_verifier');
        localStorage.removeItem('pkce_state');
        return false;
      }

      this.authState = {
        isAuthenticated: true,
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token,
        expiresAt: Date.now() + responseData.expires_in * 1000,
      };

      this.saveAuthStateToLocalStorage();
      localStorage.removeItem('pkce_verifier');
      localStorage.removeItem('pkce_state');
      
      return true;
    } catch (error) {
      console.error('Failed to authenticate with WHOOP:', error);
      localStorage.removeItem('pkce_verifier');
      localStorage.removeItem('pkce_state');
      return false;
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.authState.refreshToken) {
      console.error('No refresh token available.');
      this.logout();
      throw new Error('No refresh token available.');
    }

    try {
      const { data: responseData, error: fnError } = await supabase.functions.invoke("whoop-token-exchange", {
        body: {
          grant_type: 'refresh_token',
          refresh_token: this.authState.refreshToken,
        },
      });

      if (fnError) {
        throw new Error('Token refresh failed');
      }

      this.authState = {
        ...this.authState,
        isAuthenticated: true,
        accessToken: responseData.access_token,
        refreshToken: responseData.refresh_token || this.authState.refreshToken,
        expiresAt: Date.now() + responseData.expires_in * 1000,
      };

      this.saveAuthStateToLocalStorage();
      console.log('WHOOP token refreshed successfully.');
    } catch (error) {
      console.error('Failed to refresh WHOOP token:', error);
      this.logout();
      throw error;
    }
  }

  public logout() {
    this.authState = { isAuthenticated: false };
    localStorage.removeItem('whoopAuthState');
  }

  private async apiRequest<T>(endpoint: string): Promise<T> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated with WHOOP');
    }

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
        headers: { 'Authorization': `Bearer ${this.authState.accessToken}` }
      });
      return response.data;
    } catch (error) {
      console.error('WHOOP API request failed:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log('Received 401, attempting token refresh...');
        try {
          await this.refreshToken();
          const retryResponse = await axios.get(`${WHOOP_API_BASE_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${this.authState.accessToken}` }
          });
          return retryResponse.data;
        } catch (refreshError) {
          console.error('Token refresh failed after 401:', refreshError);
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }
      throw error;
    }
  }

  public async getProfile(): Promise<WhoopUser> {
    return this.apiRequest<WhoopUser>('/v1/user/profile');
  }

  public async getRecovery(days: number = 7): Promise<WhoopRecovery[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.apiRequest<WhoopRecovery[]>(`/v1/recovery?start=${start}&end=${end}`);
  }

  public async getStrain(days: number = 7): Promise<WhoopStrain[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.apiRequest<WhoopStrain[]>(`/v1/cycle?start=${start}&end=${end}`);
  }

  public async getSleep(days: number = 7): Promise<WhoopSleep[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.apiRequest<WhoopSleep[]>(`/v1/sleep?start=${start}&end=${end}`);
  }
}

export const whoopService = new WhoopService();
