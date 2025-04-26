
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWhoopAuth } from '@/contexts/WhoopAuthContext';
import { Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhoopStatusButton: React.FC = () => {
  const { isAuthenticated } = useWhoopAuth();

  return (
    <Button 
      variant={isAuthenticated ? "outline" : "secondary"} 
      size="sm"
      className="flex items-center gap-2"
      asChild
    >
      <Link to="/connect">
        {isAuthenticated ? (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span>WHOOP Connected</span>
          </>
        ) : (
          <>
            <X className="h-4 w-4 text-red-500" />
            <span>Connect WHOOP</span>
          </>
        )}
      </Link>
    </Button>
  );
};
