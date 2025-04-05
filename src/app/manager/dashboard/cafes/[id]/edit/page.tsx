import { Suspense } from 'react';
import { EditCafeClient } from './edit-client';
import { getCafe } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';

export default async function EditCafePage({ params }: { params: { id: string } }) {
  const cafe = await getCafe(params.id);
  
  if (!cafe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">카페를 찾을 수 없습니다</h1>
          <p className="mt-2 text-gray-600">요청하신 카페 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    }>
      <EditCafeClient cafe={cafe} />
    </Suspense>
  );
}
