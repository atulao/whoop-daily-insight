
import React from 'react';
import { Link } from 'react-router-dom';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Check, X, Settings, AlertTriangle, Lock } from 'lucide-react';
import { whoopService } from '@/services/whoopService';

export const WhoopStatusButton: React.FC = () => {
  const { isAuthenticated } = useWhoopAuth();
  const clientIdConfigured = whoopService.getClientId() !== 'whoop-client-id-placeholder' && whoopService.getClientId() !== '';

  // If the client ID isn't set, show a configuration button instead
  if (!clientIdConfigured) {
    return (
      <Link
        to="/connect"
        className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-sans font-semibold uppercase tracking-whoop transition-colors duration-200 bg-whoop-black text-whoop-white border border-whoop-recovery-low/20 hover:bg-white/10"
      >
        <Settings className="h-4 w-4 text-whoop-recovery-low" />
        <span>CONFIGURE API</span>
      </Link>
    );
  }

  // If authenticated but had issues, show warning button
  const urlParams = new URLSearchParams(window.location.search);
  const hasError = urlParams.get('error') !== null;

  if (hasError && window.location.pathname === '/connect') {
    return (
      <Link
        to="/connect"
        className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-sans font-semibold uppercase tracking-whoop transition-colors duration-200 bg-whoop-black text-whoop-white border border-whoop-recovery-low hover:bg-white/10"
      >
        <AlertTriangle className="h-4 w-4 text-whoop-recovery-low" />
        <span>API ERROR</span>
      </Link>
    );
  }

  return (
    <Link
      to="/connect"
      className={`
        inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-sans font-semibold uppercase tracking-whoop transition-colors duration-200
        ${isAuthenticated 
          ? 'bg-whoop-black text-whoop-white border border-whoop-white/20 hover:bg-white/10' 
          : 'bg-whoop-teal text-whoop-black hover:brightness-110'}
      `}
    >
      {isAuthenticated ? (
        <>
          <Check className="h-4 w-4 text-whoop-recovery-high" />
          <span>CONNECTED</span>
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" />
          <span>CONNECT WHOOP</span>
        </>
      )}
    </Link>
  );
};
