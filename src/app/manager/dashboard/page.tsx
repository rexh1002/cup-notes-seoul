import { Suspense } from 'react';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    }>
      <ManagerDashboard />
    </Suspense>
  );
}