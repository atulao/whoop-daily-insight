
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { WhoopLoginForm } from '@/components/whoop/WhoopLoginForm';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { whoopService } from '@/services/whoopService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Connect = () => {
  const { isLoading, refreshUser } = useWhoopAuth();
  const [clientId, setClientId] = useState(whoopService.getClientId() || '');
  const [showSettings, setShowSettings] = useState(
    whoopService.getClientId() === 'whoop-client-id-placeholder' || !whoopService.getClientId()
  );
  const { toast } = useToast();

  // Get the current URL to display
  const redirectUri = window.location.origin + '/connect';

  const handleSaveClientId = () => {
    if (clientId && clientId.trim() !== '') {
      whoopService.setClientId(clientId);
      toast({
        title: "Client ID saved",
        description: "Your WHOOP Client ID has been saved successfully.",
      });
      setShowSettings(false);
      refreshUser();
    } else {
      toast({
        title: "Invalid Client ID",
        description: "Please enter a valid WHOOP Client ID.",
        variant: "destructive"
      });
    }
  };

  // Check if we have an error in the URL (from OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const oauthError = urlParams.get('error');
  const oauthErrorDescription = urlParams.get('error_description');
  
  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-whoop-white mb-2 tracking-whoop">
              CONNECT WHOOP
            </h1>
            <p className="text-xl text-whoop-white/70">
              Link your WHOOP account to view your personal data
            </p>
          </div>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="bg-transparent text-whoop-white border-whoop-white/20 hover:bg-white/10"
          >
            {showSettings ? "Hide Settings" : "Configure API"}
          </Button>
        </header>

        {oauthError && (
          <Alert variant="destructive" className="bg-whoop-black border-whoop-recovery-low/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>OAuth Error: {oauthError}</AlertTitle>
            <AlertDescription>
              {oauthErrorDescription || "An error occurred during authentication."}
              {oauthError === 'invalid_client' && (
                <p className="mt-2">
                  This usually means your Client ID is incorrect or not properly configured in the WHOOP Developer Portal.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-8">
          {showSettings && (
            <Card className="bg-whoop-black/80 backdrop-blur-sm border border-whoop-white/10 rounded-lg shadow-lg overflow-hidden">
              <CardHeader className="border-b border-whoop-white/10">
                <CardTitle className="text-whoop-white">WHOOP API Configuration</CardTitle>
                <CardDescription className="text-whoop-white/70">
                  Enter your WHOOP Client ID from the WHOOP Developer Portal
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="client-id" className="text-sm font-medium text-whoop-white/70 block mb-1">
                      Client ID
                    </label>
                    <Input
                      id="client-id"
                      placeholder="Enter your WHOOP Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="bg-black/30 border-whoop-white/20 text-whoop-white"
                    />
                    <p className="text-xs text-whoop-white/50 mt-1">
                      You can get this from the WHOOP Developer Portal by creating a new application
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-sm font-medium text-whoop-white/70 block mb-1">
                      Redirect URI (for WHOOP Developer Portal)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={redirectUri}
                        className="bg-black/30 border-whoop-white/20 text-whoop-white"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(redirectUri);
                          toast({
                            title: "Copied to clipboard",
                            description: "Redirect URI copied to clipboard",
                          });
                        }}
                        className="whitespace-nowrap"
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-whoop-white/50 mt-1">
                      Use this exact URL in your WHOOP Developer Portal under "Redirect URIs"
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-whoop-white/10 pt-4">
                <Button
                  onClick={handleSaveClientId}
                  className="bg-whoop-teal text-whoop-black hover:brightness-110"
                >
                  Save Client ID
                </Button>
              </CardFooter>
            </Card>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-32 bg-whoop-black/50 backdrop-blur-sm rounded-lg border border-whoop-white/10">
              <Loader2 className="h-8 w-8 animate-spin text-whoop-teal" />
              <span className="ml-2 text-whoop-white">Authenticating with WHOOP...</span>
            </div>
          )}

          <WhoopLoginForm />

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-whoop-white tracking-whoop">ABOUT WHOOP INTEGRATION</h2>
            <div className="prose max-w-none text-whoop-white/80">
              <p className="text-whoop-white/80">
                By connecting your WHOOP account, you'll be able to access your personal health metrics
                directly within this application, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 mb-4 text-whoop-white/80">
                <li>Daily strain scores</li>
                <li>Recovery percentages</li>
                <li>Sleep performance</li>
                <li>Heart rate variability (HRV)</li>
              </ul>
              <p className="text-whoop-white/80">
                Your data remains secure and private. This integration uses WHOOP's official API
                and only requests read access to the data you choose to share.
              </p>
              <p className="text-whoop-white/80">
                You can disconnect your WHOOP account at any time, which will immediately stop
                any data syncing between WHOOP and this application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Connect;
