
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { WhoopLoginForm } from '@/components/whoop/WhoopLoginForm';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2, AlertCircle, ExternalLink, Copy, CheckIcon, InfoIcon } from 'lucide-react';
import { whoopService } from '@/services/whoopService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const Connect = () => {
  const { isLoading, refreshUser } = useWhoopAuth();
  const [clientId, setClientId] = useState(whoopService.getClientId() || '');
  const [showSettings, setShowSettings] = useState(
    whoopService.getClientId() === 'whoop-client-id-placeholder' || !whoopService.getClientId()
  );
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Get the current URL to display
  const redirectUri = window.location.origin + '/connect';
  
  // Generate a privacy policy URL (placeholder)
  const privacyPolicyUrl = window.location.origin + '/privacy';

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Text copied to clipboard successfully",
    });
    setTimeout(() => setIsCopied(false), 2000);
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
                  Make sure the redirect URI matches exactly: <code className="bg-black/30 px-2 py-0.5 rounded">{redirectUri}</code>
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
              
              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/30">
                  <TabsTrigger value="setup" className="text-whoop-white">Setup Guide</TabsTrigger>
                  <TabsTrigger value="config" className="text-whoop-white">Configuration</TabsTrigger>
                  <TabsTrigger value="scopes" className="text-whoop-white">OAuth Scopes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="setup" className="p-6">
                  <div className="space-y-6">
                    <div className="rounded-md bg-black/30 p-4">
                      <h3 className="font-semibold text-lg text-whoop-white mb-2">WHOOP Developer Portal Setup</h3>
                      <ol className="list-decimal list-inside space-y-3 text-whoop-white/80">
                        <li>Go to the <a href="https://developer.whoop.com" target="_blank" rel="noopener noreferrer" className="text-whoop-teal hover:underline inline-flex items-center">
                          WHOOP Developer Portal <ExternalLink className="h-3 w-3 ml-1" />
                        </a></li>
                        <li>Sign in and navigate to "Apps" section</li>
                        <li>Click "Create New App"</li>
                        <li>Fill in the required fields:</li>
                      </ol>
                      
                      <div className="mt-4 ml-6 space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">App Name</p>
                            <p className="text-xs text-whoop-white/50">Required</p>
                          </div>
                          <p className="text-sm text-whoop-white/70">Choose any name (e.g., "WHOOP Daily Insights")</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">Logo</p>
                            <p className="text-xs text-whoop-white/50">Required</p>
                          </div>
                          <p className="text-sm text-whoop-white/70">Upload a 1:1 ratio image (JPG or PNG), max 1MB</p>
                          <p className="text-xs text-whoop-white/50 mt-1">Make sure your image is exactly square (1:1 ratio) and less than 1MB</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">Contact Email</p>
                            <p className="text-xs text-whoop-white/50">Required</p>
                          </div>
                          <p className="text-sm text-whoop-white/70">Your email address</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">Privacy Policy URL</p>
                            <p className="text-xs text-whoop-white/50">Required</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="bg-black/30 text-xs px-2 py-1 rounded text-whoop-white/80 flex-1">{privacyPolicyUrl}</code>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(privacyPolicyUrl)} 
                              className="bg-transparent border-whoop-white/20">
                              {isCopied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-whoop-white/50 mt-1">
                            You can use this or create your own privacy policy page
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">Redirect URL</p>
                            <p className="text-xs text-whoop-white/50">Required</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="bg-black/30 text-xs px-2 py-1 rounded text-whoop-white/80 flex-1">{redirectUri}</code>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(redirectUri)} 
                              className="bg-transparent border-whoop-white/20">
                              {isCopied ? <CheckIcon className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                          <p className="text-xs text-whoop-white/50 mt-1">
                            This must match EXACTLY - copy and paste to avoid errors
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">Scopes</p>
                            <p className="text-xs text-whoop-white/50">Required</p>
                          </div>
                          <p className="text-sm text-whoop-white/70">Select at least these scopes:</p>
                          <ul className="list-disc list-inside text-xs text-whoop-white/70 mt-1 space-y-1">
                            <li>read:profile</li>
                            <li>read:recovery</li>
                            <li>read:cycles</li>
                            <li>read:workout</li>
                            <li>read:sleep</li>
                          </ul>
                          <p className="text-xs text-whoop-white/50 mt-2">
                            See the "OAuth Scopes" tab for more details about each scope
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium text-whoop-white">Webhook URL</p>
                            <p className="text-xs text-whoop-white/50">Optional</p>
                          </div>
                          <p className="text-sm text-whoop-white/70">Leave blank for now (can add later)</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 text-whoop-white/80">
                        <p>After creating the app, you'll receive a <strong>Client ID</strong> to use in the Configuration tab.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="config" className="p-6">
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
                        You can get this from the WHOOP Developer Portal after creating an application
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
                          onClick={() => copyToClipboard(redirectUri)}
                          className="whitespace-nowrap"
                        >
                          {isCopied ? <CheckIcon className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-whoop-white/50 mt-1">
                        Use this exact URL in your WHOOP Developer Portal under "Redirect URIs"
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scopes" className="p-6">
                  <div className="space-y-6">
                    <Alert variant="outline" className="bg-black/30 border-whoop-white/20">
                      <InfoIcon className="h-4 w-4 text-whoop-teal" />
                      <AlertTitle className="text-whoop-white">Understanding WHOOP API Scopes</AlertTitle>
                      <AlertDescription className="text-whoop-white/70">
                        Below are the scopes used by this application. Each scope provides access to different types of data from your WHOOP account.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4 mt-4">
                      <div className="bg-black/30 p-4 rounded-md">
                        <h3 className="font-semibold text-whoop-white mb-1">read:profile</h3>
                        <p className="text-sm text-whoop-white/70">Access to user profile data including name, email, and account information</p>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md">
                        <h3 className="font-semibold text-whoop-white mb-1">read:recovery</h3>
                        <p className="text-sm text-whoop-white/70">Access to recovery metrics including recovery score, HRV, and resting heart rate</p>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md">
                        <h3 className="font-semibold text-whoop-white mb-1">read:cycles</h3>
                        <p className="text-sm text-whoop-white/70">Access to daily cycle data including strain scores and activity metrics</p>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md">
                        <h3 className="font-semibold text-whoop-white mb-1">read:workout</h3>
                        <p className="text-sm text-whoop-white/70">Access to workout data including duration, heart rate, and other exercise metrics</p>
                      </div>

                      <div className="bg-black/30 p-4 rounded-md">
                        <h3 className="font-semibold text-whoop-white mb-1">read:sleep</h3>
                        <p className="text-sm text-whoop-white/70">Access to sleep data including duration, quality, stages, and other sleep metrics</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-whoop-white/70">
                      When authorizing this application, you will see these scopes listed on the WHOOP authorization page. 
                      You can review and approve what data this application can access.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <CardFooter className="border-t border-whoop-white/10 pt-4 pb-4">
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
              <div className="mt-6 p-4 bg-black/30 rounded-md">
                <h3 className="text-whoop-white font-medium mb-2">About OAuth Authentication</h3>
                <p className="text-sm text-whoop-white/70">
                  This app uses OAuth 2.0 to securely authenticate with WHOOP. 
                  When you click "Connect WHOOP," you'll be redirected to WHOOP's official authorization page
                  where you grant permission for this app to access your data.
                  We never see or store your WHOOP password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Connect;
