'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

const PROVIDER_NAMES: Record<string, string> = {
  naver: '네이버',
  kakao: '카카오',
  google: 'Google',
  apple: 'Apple',
};

function SignupContent() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialSignup, setIsSocialSignup] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const [socialProviderId, setSocialProviderId] = useState('');
  const [socialName, setSocialName] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const provider = searchParams.get('provider');
      const providerId = searchParams.get('providerId');
      const emailParam = searchParams.get('email');
      const nameParam = searchParams.get('name');
      if (provider && providerId && emailParam) {
        setIsSocialSignup(true);
        setSocialProvider(provider);
        setSocialProviderId(providerId);
        setEmail(emailParam);
        if (nameParam) setSocialName(nameParam);
      }
    }
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          provider: socialProvider,
          providerId: socialProviderId,
          name: socialName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '회원가입에 실패했습니다.');
      alert('회원가입이 완료되었습니다.');
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaver = () => { window.location.href = '/api/auth/naver'; };
  const handleKakao = () => { window.location.href = '/api/auth/kakao'; };
  const handleGoogle = () => { window.location.href = '/api/auth/google'; };
  const handleApple = () => { window.location.href = '/api/auth/apple'; };

  if (isSocialSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            {PROVIDER_NAMES[socialProvider] || socialProvider} 계정으로 회원가입
          </h1>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '처리 중...' : '회원가입'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            <span>계정이 있으신가요? </span>
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">로그인</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>
        )}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleNaver}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-[#03C75A] text-white hover:bg-opacity-90 transition-colors"
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.1667 0H1.83333C0.825 0 0 0.825 0 1.83333V18.1667C0 19.175 0.825 20 1.83333 20H18.1667C19.175 20 20 19.175 20 18.1667V1.83333C20 0.825 19.175 0 18.1667 0Z" fill="#03C75A"/>
                <path d="M11.6667 10.5416L8.33333 5.83325H5.83333V14.1666H8.33333V9.45825L11.6667 14.1666H14.1667V5.83325H11.6667V10.5416Z" fill="white"/>
              </svg>
            </span>
            네이버로 시작하기
          </button>
          <button
            onClick={handleKakao}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-[#FEE500] text-[#191919] hover:bg-opacity-90 transition-colors"
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 3.56 0 7.95C0 10.79 1.88 13.25 4.71 14.68C4.5 15.5 3.91 17.53 3.81 17.95C3.68 18.48 4.03 18.47 4.26 18.31C4.44 18.19 7.06 16.4 8.18 15.66C8.77 15.75 9.38 15.8 10 15.8C15.52 15.8 20 12.24 20 7.85C20 3.56 15.52 0 10 0Z" fill="#191919"/>
              </svg>
            </span>
            카카오로 시작하기
          </button>
          <button
            onClick={handleGoogle}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </span>
            Google로 시작하기
          </button>
          <button
            onClick={handleApple}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-black text-white hover:bg-gray-900 transition-colors"
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </span>
            Apple로 시작하기
          </button>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
          <div className="relative flex justify-center"><span className="px-2 bg-white text-sm text-gray-500">또는</span></div>
        </div>
        <div className="text-center">
          <Link href="/auth/manager/signup" className="text-green-600 hover:text-green-800 font-medium">
            카페 매니저로 회원가입
          </Link>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>계정이 있으신가요? </span>
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 font-medium">로그인</Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
