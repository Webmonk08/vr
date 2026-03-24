'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { user, role } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

    useEffect(() => {
      const stored = localStorage.getItem('auth-storage');
      const hasStoredAuth = stored ? !!JSON.parse(stored)?.state?.user : false;
      setHasCheckedStorage(true);
      
      if (!user && !hasStoredAuth) {
        router.replace('/login');
      } else if (user && role) {
        const hasRole = allowedRoles.some(r => r.toLowerCase() === role.toLowerCase());
        if (!hasRole) {
          router.replace('/');
        } else {
          setIsChecking(false);
        }
      } else if (user && hasStoredAuth) {
        setIsChecking(false);
      }
    }, [user, role, router]);

    if (!hasCheckedStorage || isChecking) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Loading Authentication...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
  return WithAuth;
};

export default withAuth;
