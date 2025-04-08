import { Suspense } from 'react';
import EditCafeClient from './edit-client';
import { cookies } from 'next/headers';
import { LoadingSpinner } from '@/components/loading-spinner';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

export default async function EditCafePage({ params }: { params: { id: string } }) {
  console.log('1. 페이지 렌더링 시작');
  console.log('2. params:', params);

  const cookieStore = cookies();
  console.log('3. 전체 쿠키:', cookieStore.getAll());

  const token = cookieStore.get('authToken')?.value;
  console.log('4. authToken 값:', token ? '존재함' : '없음');

  if (!token) {
    console.log('5-1. 토큰이 없어서 로그인 필요 화면 표시');
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
    console.log('5-2. API 요청 시작');
    const apiUrl = `${API_BASE_URL}/api/manager/cafes/${params.id}`;
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    console.log('6. API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
      console.log('7-1. API 오류 응답:', error);
      throw new Error(error.message || '카페 정보를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    console.log('7-2. API 성공 응답:', data);

    if (!data.success) {
      console.log('8-1. API 응답은 성공했지만 success가 false임');
      throw new Error(data.error || '카페 정보를 불러오는데 실패했습니다.');
    }

    const cafe = data.cafe;
    if (!cafe) {
      console.log('8-2. 카페 정보 없음');
      throw new Error('카페 정보가 존재하지 않습니다.');
    }

    console.log('9. 카페 정보 렌더링 시작');
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <EditCafeClient cafe={cafe} />
      </Suspense>
    );
  } catch (error) {
    console.error('10. 에러 발생:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : '카페 정보를 불러오는 중 오류가 발생했습니다.'}
          </p>
        </div>
      </div>
    );
  }
}
