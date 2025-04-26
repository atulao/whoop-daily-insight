
import React, { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { WhoopLoginForm } from '@/components/whoop/WhoopLoginForm';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2 } from 'lucide-react';

const Connect = () => {
  const { isLoading } = useWhoopAuth();

  // Check for authentication callback in URL
  useEffect(() => {
    // This will be handled by the context
  }, []);

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
              Connect WHOOP
            </h1>
            <p className="text-xl text-muted-foreground">
              Link your WHOOP account to view your personal data
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Authenticating with WHOOP...</span>
            </div>
          )}

          <WhoopLoginForm />

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">About WHOOP Integration</h2>
            <div className="prose max-w-none">
              <p>
                By connecting your WHOOP account, you'll be able to access your personal health metrics
                directly within this application, including:
              </p>
              <ul>
                <li>Daily strain scores</li>
                <li>Recovery percentages</li>
                <li>Sleep performance</li>
                <li>Heart rate variability (HRV)</li>
              </ul>
              <p>
                Your data remains secure and private. This integration uses WHOOP's official API
                and only requests read access to the data you choose to share.
              </p>
              <p>
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
