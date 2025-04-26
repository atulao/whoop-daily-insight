import React, { createContext, useContext, useState, useEffect } from 'react';
import { whoopService, WhoopUser } from '@/services/whoopService';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface WhoopAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: WhoopUser | null;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const WhoopAuthContext = createContext<WhoopAuthContextType | undefined>(undefined);

export const WhoopAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(whoopService.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<WhoopUser | null>(null);
  const { toast } = useToast();

  // Load user data on initial load if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);

  // Check for auth callback in URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (code && window.location.pathname === '/connect') {
      handleAuthCallback(code);
    } else if (error && window.location.pathname === '/connect') {
      // Handle OAuth error returned in URL
      const description = url.searchParams.get('error_description') || 'Unknown error';
      console.error('OAuth error:', error, description);
      
      toast({
        title: `Authentication Error: ${error}`,
        description: description,
        variant: 'destructive',
      });
      
      // Don't remove the error from URL so the Connect page can display it
    }
  }, []);

  const handleAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      console.log('Handling auth callback with code', code);
      const success = await whoopService.handleAuthCallback(code);
      
      if (success) {
        setIsAuthenticated(true);
        toast({
          title: 'Successfully connected to WHOOP',
          description: 'Your WHOOP data is now available in the app',
        });
        // Reload user data after successful connection
        refreshUser(); 
        // Remove code from URL
        window.history.replaceState({}, document.title, '/connect');
      } else {
        // Ensure toast is shown if handleAuthCallback returns false without throwing
        toast({
          title: 'Failed to connect to WHOOP',
          description: 'Authentication failed after callback. Please check configuration and try again.',
          variant: 'destructive',
        });
        // Optionally clear the code from URL even on failure to avoid loops?
        // window.history.replaceState({}, document.title, '/connect');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication error',
        description: error instanceof Error ? error.message : 'An error occurred during authentication',
        variant: 'destructive',
      });
      
      // If API returns 401 Unauthorized, logout (refresh already attempted in apiRequest)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast({ 
          title: "Session Expired", 
          description: "Please log in again.", 
          variant: "destructive" 
        });
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const loginUrl = await whoopService.getLoginUrl();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Configuration error',
        description: error instanceof Error ? error.message : 'Please configure your WHOOP Client ID first',
        variant: 'destructive',
      });
    }
  };

  const logout = () => {
    whoopService.logout();
    setIsAuthenticated(false);
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out of your WHOOP account',
    });
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const userData = await whoopService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast({
        title: 'Failed to load profile',
        description: 'Could not retrieve your WHOOP profile',
        variant: 'destructive',
      });
      
      // If API returns 401 Unauthorized, logout
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhoopAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </WhoopAuthContext.Provider>
  );
};

export const useWhoopAuth = () => {
  const context = useContext(WhoopAuthContext);
  if (context === undefined) {
    throw new Error('useWhoopAuth must be used within a WhoopAuthProvider');
  }
  return context;
};
