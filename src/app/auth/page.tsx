'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // /auth 접근 시 실제 로그인 페이지로 통일
    router.replace('/auth/login');
  }, [router]);

  return null;
} 