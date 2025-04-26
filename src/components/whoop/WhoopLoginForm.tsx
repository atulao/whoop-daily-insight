
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2 } from 'lucide-react';

export const WhoopLoginForm: React.FC = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useWhoopAuth();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>WHOOP Integration</CardTitle>
        <CardDescription>
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
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Access your personal metrics including strain, recovery, and sleep data
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isAuthenticated ? (
          <Button variant="outline" onClick={logout} className="w-full">
            Disconnect WHOOP
          </Button>
        ) : (
          <Button onClick={login} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect WHOOP'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
