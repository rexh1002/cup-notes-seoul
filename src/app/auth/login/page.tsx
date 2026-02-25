'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const [error, setError] = useState('');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      const err = searchParams.get('error');
      if (err === 'signup_required') {
        const provider = searchParams.get('provider');
        const providerId = searchParams.get('providerId');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        alert('가입되지 않은 계정입니다. 회원가입을 먼저 진행해주세요.');
        router.push(`/auth/signup?provider=${provider}&providerId=${providerId}&email=${encodeURIComponent(email || '')}&name=${encodeURIComponent(name || '')}`);
        return;
      }
      const msg = searchParams.get('msg');
      if (err && msg) setError(decodeURIComponent(msg));
      else if (err === 'auth_failed') setError('인증에 실패했습니다. 다시 시도해주세요.');
      else if (err === 'no_code') setError('인증 코드를 받지 못했습니다.');
      else if (err === 'token_request_failed') setError('토큰 요청에 실패했습니다.');
      else if (err === 'profile_request_failed') setError('프로필 조회에 실패했습니다.');
      else if (err === 'email_not_provided' || err === 'email_required') setError('이메일 제공 동의가 필요합니다.');
    }
  }, [searchParams, router]);

  const handleNaverLogin = () => { window.location.href = '/api/auth/naver'; };
  const handleKakaoLogin = () => { window.location.href = '/api/auth/kakao'; };
  const handleGoogleLogin = () => { window.location.href = '/api/auth/google'; };
  const handleAppleLogin = () => { window.location.href = '/api/auth/apple'; };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSignupModal(true);
  };

  const handleSocialSignup = () => {
    setShowSignupModal(false);
    router.push('/auth/signup');
  };

  const handleManagerSignup = () => {
    setShowSignupModal(false);
    router.push('/auth/manager/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={handleNaverLogin}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-[#03C75A] text-white hover:bg-opacity-90 transition-colors"
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
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 3.56 0 7.95C0 10.79 1.88 13.25 4.71 14.68C4.5 15.5 3.91 17.53 3.81 17.95C3.68 18.48 4.03 18.47 4.26 18.31C4.44 18.19 7.06 16.4 8.18 15.66C8.77 15.75 9.38 15.8 10 15.8C15.52 15.8 20 12.24 20 7.85C20 3.56 15.52 0 10 0Z" fill="#191919"/>
              </svg>
            </span>
            카카오로 로그인
          </button>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </span>
            Google로 로그인
          </button>
          <button
            onClick={handleAppleLogin}
            className="w-full py-2.5 px-4 flex items-center justify-center rounded-md font-medium bg-black text-white hover:bg-gray-900 transition-colors"
          >
            <span className="mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </span>
            Apple로 로그인
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <span>계정이 없으신가요? </span>
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800" onClick={handleSignupClick}>
            회원가입
          </Link>
        </div>
      </div>

      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-center mb-4">회원가입</h3>
            <p className="text-center text-gray-600 mb-6">가입하실 회원 유형을 선택해주세요</p>
            <div className="space-y-3">
              <button
                onClick={handleSocialSignup}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                소셜로 회원가입 (네이버/카카오/Google/Apple)
              </button>
              <button
                onClick={handleManagerSignup}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                카페 매니저 회원가입
              </button>
            </div>
            <button
              onClick={() => setShowSignupModal(false)}
              className="w-full mt-4 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
