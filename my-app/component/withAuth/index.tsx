'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  roles: Array<'admin' | 'customer'>
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      // 1. Wait until the store is actually initialized 
      // (If you have a 'loading' flag in your store, use that instead of isChecking)
      if (user == undefined) return;

      const userRole = user?.user_metadata?.role;
      console.log(user)
      if (!user) {
        router.replace('/login');
      } else if (!roles.includes(userRole)) {
        router.replace('/');
      } else {
        setIsChecking(false);
      }
    }, [user, router]);

    // Show loading while we determine auth status to prevent premature redirects
    if (isChecking || !user || !roles.includes(user?.user_metadata?.role)) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Loading Authentication...</p>
        </div>
      );
    }
    console.log("gonna return")
    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default withAuth;
