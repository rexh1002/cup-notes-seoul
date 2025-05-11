import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function MobileHeader({ isLoggedIn, userRole, onLogout }: { isLoggedIn: boolean, userRole: string | null, onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] h-14 bg-white/90 backdrop-blur border-b border-indigo-200 shadow-sm flex items-center justify-between px-4 sm:hidden">
      <button
        className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-lg select-none focus:outline-none"
        onClick={() => window.location.reload()}
        aria-label="홈 새로고침"
        type="button"
      >
        CUP NOTES SEOUL
      </button>
      <button onClick={() => setOpen(v => !v)} className="p-2 rounded-md hover:bg-gray-100">
        <Menu className="w-7 h-7 text-gray-700" />
      </button>
      {open && (
        <div className="absolute right-4 top-14 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-[210] animate-fade-in">
          {!isLoggedIn && (
            <>
              <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={() => { setOpen(false); router.push('/auth/login'); }}>로그인</button>
              <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={() => { setOpen(false); router.push('/auth/signup'); }}>회원가입</button>
            </>
          )}
          {isLoggedIn && (
            <>
              {(userRole === 'cafeManager' || userRole === 'manager') && (
                <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={() => { setOpen(false); router.push('/manager/dashboard'); }}>내카페관리</button>
              )}
              <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={() => { setOpen(false); onLogout(); }}>로그아웃</button>
            </>
          )}
        </div>
      )}
    </header>
  );
} 