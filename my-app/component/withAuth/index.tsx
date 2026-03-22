'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  roles: Array<'ADMIN' | 'CUSTOMER' | 'OWNER'>
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { user, role } = useAuthStore();
    console.log("with auth", role, "user", user)
    console.log(!user)
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    console.log("entered")
    console.log(user)
    console.log("with-auth", role)

    useEffect(() => {
      // 1. Wait until the store is actually initialized 
      if (user === undefined) return;

      if (!user) {
        router.replace('/login');
      } else if (role && !roles.includes(role as any)) {
        router.replace('/');
      } else if (role) {
        setIsChecking(false);
      }
    }, [user, role, router]);

    // Show loading while we determine auth status to prevent premature redirects
    if (isChecking || !user || !role || !roles.includes(role as any)) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Loading Authentication...</p>
        </div>
      );
    }

    console.log("gonna return")
    return <WrappedComponent {...props} />;
  };
  console.log("returoin")
  return WithAuth;
};

export default withAuth;
