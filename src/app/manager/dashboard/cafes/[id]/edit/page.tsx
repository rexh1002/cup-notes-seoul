import { Suspense } from 'react';
import EditCafeClient from './edit-client';
import { cookies } from 'next/headers';
import { LoadingSpinner } from '@/components/loading-spinner';

export default async function EditCafePage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">이 페이지에 접근하려면 로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  try {
    const response = await fetch(`/api/manager/cafes/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">카페를 찾을 수 없습니다</h1>
            <p className="text-gray-600">{error.message || '요청하신 카페 정보를 찾을 수 없습니다.'}</p>
          </div>
        </div>
      );
    }

    const data = await response.json();
    const cafe = data.cafe;

    if (!cafe) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">카페 정보 없음</h1>
            <p className="text-gray-600">카페 정보가 존재하지 않습니다.</p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <EditCafeClient cafe={cafe} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600">카페 정보를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }
}
