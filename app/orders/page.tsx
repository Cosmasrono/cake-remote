'use client';

import React from 'react';
import OrdersTab from '@/app/components/OrdersTab';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const { data: session, status } = useSession() as { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const router = useRouter();

  if (status === 'loading') {
    return <div className="text-center py-12">Loading user session...</div>;
  }

  if (!session?.user?.id) {
    router.push('/login'); // Redirect to login if not authenticated
    return null;
  }

  return (
    <OrdersTab userId={session.user.id} />
  );
}
