
import React from 'react';
import { Link } from 'react-router-dom';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Check, X } from 'lucide-react';

export const WhoopStatusButton: React.FC = () => {
  const { isAuthenticated } = useWhoopAuth();

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
          <X className="h-4 w-4 text-whoop-recovery-low" />
          <span>CONNECT WHOOP</span>
        </>
      )}
    </Link>
  );
};
