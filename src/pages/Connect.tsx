import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { WhoopLoginForm } from '@/components/whoop/WhoopLoginForm';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2, AlertCircle, Shield, Zap, Eye, Lock } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const Connect = () => {
  const { isAuthenticated, isLoading } = useWhoopAuth();

  const urlParams = new URLSearchParams(window.location.search);
  const oauthError = urlParams.get('error');
  const oauthErrorDescription = urlParams.get('error_description');
  const redirectUri = window.location.origin + '/connect';

  const features = [
    { icon: Zap, label: 'Strain', description: 'Real-time cardiovascular load tracking' },
    { icon: Eye, label: 'Recovery', description: 'HRV-based recovery scoring' },
    { icon: Shield, label: 'Sleep', description: 'Sleep stage analysis & coaching' },
  ];
  
  return (
    <MainLayout>
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/3 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header */}
          <header className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-whoop mb-4">
              <Lock className="h-3 w-3" />
              {isAuthenticated ? 'Connected' : 'Secure OAuth 2.0'}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              {isAuthenticated ? 'YOU\'RE IN' : 'CONNECT'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto">
              {isAuthenticated 
                ? 'Your WHOOP data is flowing. Head to your dashboard.'
                : 'One tap to unlock your personal strain, recovery, and sleep data.'}
            </p>
          </header>

          {/* OAuth error */}
          {oauthError && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Authentication Error</AlertTitle>
              <AlertDescription className="text-xs">
                {oauthErrorDescription || "Something went wrong during authentication."}
                {oauthError === 'invalid_client' && (
                  <p className="mt-2">
                    Redirect URI mismatch. Expected: <code className="bg-background/50 px-1.5 py-0.5 rounded text-[10px]">{redirectUri}</code>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center h-24 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-3 text-foreground text-sm">Authenticating with WHOOP...</span>
            </div>
          )}

          {/* Main card */}
          <WhoopLoginForm />

          {/* Feature pills */}
          {!isAuthenticated && (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              {features.map(({ icon: Icon, label, description }) => (
                <div key={label} className="group text-center p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  <Icon className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-whoop">{label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer trust text */}
          <p className="text-center text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed">
            Read-only access via WHOOP's official API. Your credentials are never stored. Disconnect anytime.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Connect;
