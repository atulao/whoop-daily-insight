import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { WhoopLoginForm } from '@/components/whoop/WhoopLoginForm';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Connect = () => {
  const { isLoading } = useWhoopAuth();

  // Check if we have an error in the URL (from OAuth callback)
  const urlParams = new URLSearchParams(window.location.search);
  const oauthError = urlParams.get('error');
  const oauthErrorDescription = urlParams.get('error_description');
  const redirectUri = window.location.origin + '/connect';
  
  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="py-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-whoop-white mb-2 tracking-whoop">
            CONNECT WHOOP
          </h1>
          <p className="text-xl text-whoop-white/70">
            Link your WHOOP account to view your personal data
          </p>
        </header>

        {oauthError && (
          <Alert variant="destructive" className="bg-whoop-black border-whoop-recovery-low/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>OAuth Error: {oauthError}</AlertTitle>
            <AlertDescription>
              {oauthErrorDescription || "An error occurred during authentication."}
              {oauthError === 'invalid_client' && (
                <p className="mt-2">
                  This usually means the Client ID is incorrect or the redirect URI doesn't match.
                  Expected redirect URI: <code className="bg-black/30 px-2 py-0.5 rounded">{redirectUri}</code>
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-32 bg-whoop-black/50 backdrop-blur-sm rounded-lg border border-whoop-white/10">
            <Loader2 className="h-8 w-8 animate-spin text-whoop-teal" />
            <span className="ml-2 text-whoop-white">Authenticating with WHOOP...</span>
          </div>
        )}

        <WhoopLoginForm />

        <div className="text-center">
          <div className="prose max-w-none text-whoop-white/60 text-sm">
            <p>
              Your data remains secure and private. This integration uses WHOOP's official API
              with OAuth 2.0 and only requests read access to your data.
            </p>
            <p className="mt-2">
              You can disconnect your WHOOP account at any time.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Connect;
