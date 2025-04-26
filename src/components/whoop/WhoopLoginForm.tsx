
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2 } from 'lucide-react';

export const WhoopLoginForm: React.FC = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useWhoopAuth();

  return (
    <Card className="w-full max-w-md mx-auto bg-whoop-black/80 backdrop-blur-sm border-whoop-teal/20">
      <CardHeader>
        <CardTitle className="text-whoop-white uppercase tracking-whoop">WHOOP Integration</CardTitle>
        <CardDescription className="text-whoop-white/70">
          {isAuthenticated 
            ? 'Your WHOOP account is connected' 
            : 'Connect your WHOOP account to see your real data'}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
        ) : (
          <div className="text-center py-4">
            <p className="text-whoop-white/70 mb-4">
              Access your personal metrics including strain, recovery, and sleep data
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isAuthenticated ? (
          <button 
            onClick={logout} 
            className="w-full bg-whoop-black border border-whoop-white/20 rounded-md py-2 px-4 text-whoop-white font-sans font-semibold uppercase tracking-whoop text-sm hover:bg-white/10 transition-colors duration-200"
          >
            DISCONNECT WHOOP
          </button>
        ) : (
          <button 
            onClick={login} 
            disabled={isLoading} 
            className="w-full bg-whoop-teal text-whoop-black rounded-md py-2 px-4 font-sans font-semibold uppercase tracking-whoop text-sm hover:brightness-110 transition-all duration-200 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                CONNECTING...
              </>
            ) : (
              'CONNECT WHOOP'
            )}
          </button>
        )}
      </CardFooter>
    </Card>
  );
};
