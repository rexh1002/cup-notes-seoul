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

function AuthContent() {
  const searchParams = useSearchParams();
  const initialTypeParam = searchParams?.get('type') ?? null;
  const initialType: SignupType =
    initialTypeParam === 'manager' ? 'manager' : 'user';

  const [signupType, setSignupType] = useState<SignupType>(initialType);

  const handleSocialClick = (provider: string) => {
    const role = signupType === 'manager' ? 'manager' : 'user';
    // 소셜 로그인/회원가입 시작
    window.location.href = `/api/auth/${provider}?role=${role}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
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
              className="w-full py-2.5 px-4 rounded-md border border-gray-200 flex items-center justify-center text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <span className="mr-1">{provider.label}</span>
              <span>
                로 {signupType === 'manager' ? '매니저 ' : ''}회원가입 / 로그인
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400">
          계속 진행하면 서비스 이용 약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

