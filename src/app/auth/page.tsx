'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // /auth 접근 시 실제 로그인 페이지로 통일
    router.replace('/auth/login');
  }, [router]);

  // null 대신 최소 UI로 hydration/라우팅 부작용 방지
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">리다이렉트 중...</p>
    </div>
  );
} 