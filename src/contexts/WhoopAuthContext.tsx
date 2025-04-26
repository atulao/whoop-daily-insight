
import React, { createContext, useContext, useState, useEffect } from 'react';
import { whoopService, WhoopUser } from '@/services/whoopService';
import { useToast } from '@/hooks/use-toast';

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
    
    if (code && window.location.pathname === '/connect') {
      handleAuthCallback(code);
    }
  }, []);

  const handleAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const success = await whoopService.handleAuthCallback(code);
      if (success) {
        setIsAuthenticated(true);
        toast({
          title: 'Successfully connected to WHOOP',
          description: 'Your WHOOP data is now available in the app',
        });
      } else {
        toast({
          title: 'Failed to connect to WHOOP',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication error',
        description: 'An error occurred during authentication',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      // Remove code from URL
      window.history.replaceState({}, document.title, '/connect');
    }
  };

  const login = () => {
    window.location.href = whoopService.getLoginUrl();
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
