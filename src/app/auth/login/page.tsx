'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Divider } from '../../../components/ui/divider';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const signupError = searchParams.get('error');
      if (signupError === 'signup_required') {
        const provider = searchParams.get('provider');
        const providerId = searchParams.get('providerId');
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        alert('가입되지 않은 계정입니다. 회원가입을 먼저 진행해주세요.');
        
        const signupUrl = `/auth/signup?provider=${provider}&providerId=${providerId}&email=${email}&name=${name}`;
        router.push(signupUrl);
      }
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('로그인 요청 시작'); // 디버깅용 로그

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('응답 데이터:', data); // 디버깅용 로그

      if (!res.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      // 토큰 저장
      if (data.token) {
        console.log('토큰 저장:', data.token); // 디버깅용 로그
        localStorage.setItem('authToken', data.token);
      } else {
        throw new Error('토큰이 응답에 포함되지 않았습니다.');
      }

      alert('로그인 성공!');
      router.push('/'); // 메인 페이지로 이동
    } catch (err: any) {
      console.error('로그인 오류:', err.message || err); // 디버깅용 로그
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    window.location.href = '/api/auth/naver';
  };

  const handleKakaoLogin = () => {
    window.location.href = '/api/auth/kakao';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        {/* 소셜 로그인 버튼 영역 */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleNaverLogin}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-[#03C75A] text-white hover:bg-opacity-90 transition-colors"
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.1667 0H1.83333C0.825 0 0 0.825 0 1.83333V18.1667C0 19.175 0.825 20 1.83333 20H18.1667C19.175 20 20 19.175 20 18.1667V1.83333C20 0.825 19.175 0 18.1667 0Z" fill="#03C75A"/>
                <path d="M11.6667 10.5416L8.33333 5.83325H5.83333V14.1666H8.33333V9.45825L11.6667 14.1666H14.1667V5.83325H11.6667V10.5416Z" fill="white"/>
              </svg>
            </span>
            네이버로 로그인
          </button>
          
          <button
            onClick={handleKakaoLogin}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-[#FEE500] text-[#191919] hover:bg-opacity-90 transition-colors"
            disabled={isLoading}
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 3.56 0 7.95C0 10.79 1.88 13.25 4.71 14.68C4.5 15.5 3.91 17.53 3.81 17.95C3.68 18.48 4.03 18.47 4.26 18.31C4.44 18.19 7.06 16.4 8.18 15.66C8.77 15.75 9.38 15.8 10 15.8C15.52 15.8 20 12.24 20 7.85C20 3.56 15.52 0 10 0Z" fill="#191919"/>
              </svg>
            </span>
            카카오로 로그인
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-sm text-gray-500">또는</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '처리 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <span>계정이 없으신가요? </span>
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}