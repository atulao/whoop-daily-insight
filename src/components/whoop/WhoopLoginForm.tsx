
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2, AlertTriangle, Lock } from 'lucide-react';
import { whoopService } from '@/services/whoopService';

export const WhoopLoginForm: React.FC = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useWhoopAuth();
  const clientIdConfigured = whoopService.getClientId() !== 'whoop-client-id-placeholder' && whoopService.getClientId() !== '';

  const handleLogin = () => {
    if (!clientIdConfigured) {
      alert('Please configure your WHOOP Client ID first');
      return;
    }
    login();
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-whoop-black backdrop-blur-sm border border-whoop-white/10 rounded-lg shadow-lg overflow-hidden">
      <CardHeader className="border-b border-whoop-white/10 bg-black/40">
        <CardTitle className="text-whoop-white uppercase tracking-whoop text-center">WHOOP INTEGRATION</CardTitle>
        <CardDescription className="text-whoop-white/70 text-center">
          {isAuthenticated 
            ? 'Your WHOOP account is connected' 
            : 'Connect your WHOOP account to see your real data'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-whoop-white/50">Name</p>
                <p className="font-sans text-whoop-white">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-whoop-white/50">Email</p>
                <p className="font-sans text-whoop-white">{user.email}</p>
              </div>
            </div>
          </div>
        ) : !clientIdConfigured ? (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-whoop-recovery-low mx-auto mb-2" />
            <p className="text-whoop-white/70 mb-4">
              You need to configure your WHOOP Client ID before connecting
            </p>
            <p className="text-xs text-whoop-white/50">
              Use the "Configure API" button at the top of this page
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <Lock className="h-12 w-12 text-whoop-teal mx-auto mb-2" />
            <p className="text-whoop-white/70 mb-4">
              Access your personal metrics including strain, recovery, and sleep data
            </p>
            <div className="text-xs text-whoop-white/50 bg-black/30 p-3 rounded-md">
              When you connect, you'll be redirected to WHOOP's secure login page.
              Your WHOOP credentials are never stored in this application.
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0">
        {isAuthenticated ? (
          <button 
            onClick={logout} 
            className="w-full bg-whoop-black border border-whoop-white/20 rounded-md py-3 px-4 text-whoop-white font-sans font-semibold uppercase tracking-whoop text-sm hover:bg-white/10 transition-colors duration-200"
          >
            DISCONNECT WHOOP
          </button>
        ) : (
          <button 
            onClick={handleLogin} 
            disabled={isLoading || !clientIdConfigured} 
            className="w-full bg-whoop-teal text-whoop-black rounded-md py-3 px-4 font-sans font-semibold uppercase tracking-whoop text-sm hover:brightness-110 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                CONNECTING...
              </>
            ) : (
              'CONNECT WITH WHOOP'
            )}
          </button>
        )}
      </CardFooter>
    </Card>
  );
};
