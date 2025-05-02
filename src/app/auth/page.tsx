'use client';
import { useRouter } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';

export default function AuthMobilePage() {
  const router = useRouter();
  // 모바일 환경이 아니면 리다이렉트
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    router.replace('/');
    return null;
  }

  // TODO: 실제 로그인/로그아웃 로직 연결 필요
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 pb-16">
      <button className="w-48 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg shadow hover:bg-blue-700 transition">로그인</button>
      <button className="w-48 py-3 rounded-lg bg-gray-200 text-gray-800 font-bold text-lg shadow hover:bg-gray-300 transition">로그아웃</button>
      <MobileNavBar current="auth" />
    </div>
  );
} 