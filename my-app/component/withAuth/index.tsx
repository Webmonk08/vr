
'use client';

import { useUser } from '@/store/useUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  roles: Array<'admin' | 'customer'>
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { user, role, loading, fetchUser } = useUser();
    const router = useRouter();

    useEffect(() => {
      fetchUser();
    }, []);

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      } else if (!loading && user && !roles.includes(role as 'admin' | 'customer')) {
        router.replace('/');
      }
    }, [user, loading, role, router, roles]);

    if (loading || !user || !roles.includes(role as 'admin' | 'customer')) {
      return <div>Loading...</div>; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default withAuth;
