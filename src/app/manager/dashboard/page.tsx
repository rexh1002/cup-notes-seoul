import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import DashboardClient from './dashboard-client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <DashboardClient />
    </Suspense>
  );
}