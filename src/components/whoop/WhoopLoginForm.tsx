import React from 'react';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Loader2, CheckCircle, ArrowRight, Unlink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WhoopLoginForm: React.FC = () => {
  const { isAuthenticated, isLoading, user, login, logout } = useWhoopAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    return (
      <div className="relative rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
        {/* Success glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-4 font-semibold text-sm uppercase tracking-whoop hover:brightness-110 transition-all duration-200"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 rounded-xl border border-border py-3 px-4 text-muted-foreground text-sm hover:text-foreground hover:border-destructive/50 hover:bg-destructive/5 transition-all duration-200"
              title="Disconnect"
            >
              <Unlink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-500">
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
      
      <div className="relative p-8 space-y-6">
        {/* Animated ring */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary/40 transition-colors duration-500">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-500">
                <span className="text-2xl font-bold text-primary tracking-tighter">W</span>
              </div>
            </div>
            <div className="absolute -inset-1 rounded-full border border-primary/10 animate-pulse-glow pointer-events-none" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Tap below to securely link your WHOOP account
          </p>
        </div>

        <button
          onClick={() => login()}
          disabled={isLoading}
          className="w-full relative bg-primary text-primary-foreground rounded-xl py-4 px-6 font-semibold text-sm uppercase tracking-whoop hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,241,159,0.15)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              CONNECTING...
            </span>
          ) : (
            'CONNECT WITH WHOOP'
          )}
        </button>
      </div>
    </div>
  );
};
