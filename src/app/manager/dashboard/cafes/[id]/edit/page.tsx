import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import EditCafeClient from './edit-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function EditCafePage({ params }: { params: { id: string } }) {
  console.log('1. 페이지 렌더링 시작');

  // 쿠키에서 토큰 가져오기
  const cookieStore = cookies();
  const token = cookieStore.get('authToken')?.value;

  console.log('2. 인증 토큰 확인:', token ? '존재함' : '없음');

  if (!token) {
    console.log('3. 토큰 없음 - 로그인 페이지로 리다이렉트');
    redirect('/auth/login');
  }

  try {
    console.log('4. API 요청 준비');
    // API 요청 URL 설정
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NEXT_PUBLIC_API_HOST || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/manager/cafes/${params.id}`;
    
    console.log('5. API 요청 URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('6. API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('7. API 오류 응답:', errorData);
      
      // 401 또는 403 오류 시 로그인 페이지로 리다이렉트
      if (response.status === 401 || response.status === 403) {
        console.log('8. 인증/권한 오류 - 로그인 페이지로 리다이렉트');
        redirect('/auth/login');
      }
      
      throw new Error(errorData.error || '카페 정보를 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    console.log('9. API 응답 데이터 확인');

    if (!data.success || !data.cafe) {
      console.error('10. 유효하지 않은 응답 데이터:', data);
      throw new Error('카페 정보가 존재하지 않습니다.');
    }

    console.log('11. 카페 정보 렌더링 시작');
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <EditCafeClient cafe={data.cafe} />
      </Suspense>
    );
  } catch (error) {
    console.error('12. 오류 발생:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">오류가 발생했습니다</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : '카페 정보를 불러오는 중 오류가 발생했습니다.'}
          </p>
          <Link href="/manager/dashboard">
            <Button variant="default">
              대시보드로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
