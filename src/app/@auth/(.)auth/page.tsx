'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type SignupType = 'user' | 'manager';

const PROVIDER_LABELS: { id: string; label: string }[] = [
  { id: 'naver', label: '네이버' },
  { id: 'kakao', label: '카카오' },
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
];

function getProviderButtonClass(providerId: string): string {
  switch (providerId) {
    case 'naver':
      return 'w-full py-3 px-4 rounded-md font-medium bg-[#03C75A] text-white hover:bg-[#02b354] transition-colors';
    case 'kakao':
      return 'w-full py-3 px-4 rounded-md font-medium bg-[#FEE500] text-[#191919] hover:bg-[#FADA0A] transition-colors';
    case 'google':
      return 'w-full py-3 px-4 rounded-md font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors';
    case 'apple':
      return 'w-full py-3 px-4 rounded-md font-medium bg-black text-white hover:bg-gray-900 transition-colors';
    default:
      return 'w-full py-3 px-4 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors';
  }
}

function ProviderIcon({ id }: { id: string }) {
  if (id === 'naver') {
    return (
      <span className="mr-2 flex items-center">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <rect width="20" height="20" rx="4" fill="#03C75A" />
          <path
            d="M11.6667 10.5416L8.33333 5.83325H5.83333V14.1666H8.33333V9.45825L11.6667 14.1666H14.1667V5.83325H11.6667V10.5416Z"
            fill="white"
          />
        </svg>
      </span>
    );
  }
  if (id === 'kakao') {
    return (
      <span className="mr-2 flex items-center">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 0C4.48 0 0 3.56 0 7.95C0 10.79 1.88 13.25 4.71 14.68C4.5 15.5 3.91 17.53 3.81 17.95C3.68 18.48 4.03 18.47 4.26 18.31C4.44 18.19 7.06 16.4 8.18 15.66C8.77 15.75 9.38 15.8 10 15.8C15.52 15.8 20 12.24 20 7.85C20 3.56 15.52 0 10 0Z"
            fill="#191919"
          />
        </svg>
      </span>
    );
  }
  if (id === 'google') {
    return (
      <span className="mr-2 flex items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </span>
    );
  }
  if (id === 'apple') {
    return (
      <span className="mr-2 flex items-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
      </span>
    );
  }
  return null;
}

function AuthOverlayContent() {
  const searchParams = useSearchParams();
  const initialTypeParam = searchParams?.get('type') ?? null;
  const initialType: SignupType =
    initialTypeParam === 'manager' ? 'manager' : 'user';

  const [signupType, setSignupType] = useState<SignupType>(initialType);

  const handleSocialClick = (provider: string) => {
    const role = signupType === 'manager' ? 'manager' : 'user';
    window.location.href = `/api/auth/${provider}?role=${role}`;
  };

  return (
    <div className="pointer-events-auto w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">회원가입 / 로그인</h1>
        <p className="text-sm text-gray-500">
          일반 회원 또는 카페 매니저를 선택한 뒤, 소셜 계정으로 진행하세요.
          이미 가입한 경우에도 동일한 버튼으로 로그인됩니다.
        </p>
      </div>

      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
        <button
          type="button"
          onClick={() => setSignupType('user')}
          className={`flex-1 py-2 ${
            signupType === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          일반 회원가입
        </button>
        <button
          type="button"
          onClick={() => setSignupType('manager')}
          className={`flex-1 py-2 ${
            signupType === 'manager'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          카페 매니저 회원가입
        </button>
      </div>

      {signupType === 'manager' && (
        <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800">
          카페 매니저로 가입하면 내 카페 등록, 정보 수정 등
          매니저 전용 대시보드에 접근할 수 있습니다.
        </div>
      )}

      <div className="space-y-3">
        {PROVIDER_LABELS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => handleSocialClick(provider.id)}
            className={getProviderButtonClass(provider.id)}
          >
            <div className="flex items-center justify-center">
              <ProviderIcon id={provider.id} />
              <span className="mr-1">
                {provider.id === 'google' ? 'Google' : provider.label}
              </span>
              <span>
                로 {signupType === 'manager' ? '매니저 ' : ''}회원가입 / 로그인
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        계속 진행하면 서비스 이용 약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
      </p>
    </div>
  );
}

export default function AuthOverlayPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <Suspense fallback={null}>
        <AuthOverlayContent />
      </Suspense>
    </div>
  );
}

