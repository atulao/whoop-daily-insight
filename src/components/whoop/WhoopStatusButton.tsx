import React from 'react';
import { Link } from 'react-router-dom';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Check, X, Settings, AlertTriangle, Lock } from 'lucide-react';

export const WhoopStatusButton: React.FC = () => {
  const { isAuthenticated } = useWhoopAuth();

  // Check for OAuth error on the connect page
  const urlParams = new URLSearchParams(window.location.search);
  const hasError = urlParams.get('error') !== null;
  const isConnectPage = window.location.pathname === '/connect';

  if (hasError && isConnectPage) {
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
  
  // Default button showing Connect/Connected status
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
