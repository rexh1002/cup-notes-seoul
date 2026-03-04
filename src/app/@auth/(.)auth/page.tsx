'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type SignupType = 'user' | 'manager';

const PROVIDER_LABELS: { id: string; label: string }[] = [
  { id: 'naver', label: '네이버' },
  { id: 'kakao', label: '카카오' },
  { id: 'google', label: 'Google' },
];

function getProviderButtonClass(providerId: string): string {
  switch (providerId) {
    case 'naver':
      return 'w-full py-3 px-4 rounded-md font-medium bg-[#03C75A] text-white hover:bg-[#02b354] transition-colors';
    case 'kakao':
      return 'w-full py-3 px-4 rounded-md font-medium bg-[#FEE500] text-[#191919] hover:bg-[#FADA0A] transition-colors';
    case 'google':
      return 'w-full py-3 px-4 rounded-md font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors';
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
  return null;
}

function AuthOverlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTypeParam = searchParams?.get('type') ?? null;
  const initialType: SignupType =
    initialTypeParam === 'manager' ? 'manager' : 'user';

  const [signupType, setSignupType] = useState<SignupType>(initialType);

  const handleSocialClick = (provider: string) => {
    const role = signupType === 'manager' ? 'manager' : 'user';
    window.location.href = `/api/auth/${provider}?role=${role}`;
  };

  const handleClose = () => {
    // 히스토리가 있으면 뒤로가기, 그렇지 않으면 메인으로 이동
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="relative pointer-events-auto w-full max-w-md rounded-2xl border border-gray-200/70 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.18)] px-7 py-6 space-y-6">
      <button
        type="button"
        aria-label="닫기"
        className="absolute top-4 right-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-200/80 bg-white/80 text-xs text-gray-400 backdrop-blur hover:text-gray-700 hover:border-gray-300 transition-colors"
        onClick={handleClose}
      >
        ✕
      </button>
      <div className="text-center space-y-2 mt-1">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium tracking-wide text-gray-500">
          Welcome to Cup Notes Seoul
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mt-1">
          회원가입 / 로그인
        </h1>
        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
          일반 회원 또는 카페 매니저를 선택한 뒤,<br />
          소셜 계정으로 가볍게 시작해 보세요.<br />
          이미 가입한 경우에도 동일한 버튼으로 바로 로그인됩니다.
        </p>
      </div>

      <div className="flex rounded-full bg-gray-100 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setSignupType('user')}
          className={`flex-1 rounded-full py-2 transition-colors ${
            signupType === 'user'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          일반 회원가입
        </button>
        <button
          type="button"
          onClick={() => setSignupType('manager')}
          className={`flex-1 rounded-full py-2 transition-colors ${
            signupType === 'manager'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'bg-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          카페 매니저 회원가입
        </button>
      </div>

      {signupType === 'manager' && (
        <div className="rounded-xl bg-blue-50/70 border border-blue-100/80 px-3 py-2 text-[11px] text-blue-800 text-left">
          카페 매니저로 가입하면 내 카페 등록, 정보 수정 등 매니저 전용 대시보드에
          접근할 수 있어요.
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

      <p className="text-center text-xs text-gray-400 leading-relaxed">
        계속 진행하면 서비스 이용 약관 및 개인정보 처리방침에<br />
        동의한 것으로 간주됩니다.
      </p>
    </div>
  );
}

export default function AuthOverlayPage() {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-sm">
      <Suspense fallback={null}>
        <AuthOverlayContent />
      </Suspense>
    </div>
  );
}

