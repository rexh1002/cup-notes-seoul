'use client';
import FilterPanel from '../../components/FilterPanel';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';
import React from 'react';
import { Search, Coffee, LogIn, UserPlus, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function FiltersPage() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedRoast, setSelectedRoast] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const router = useRouter();
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 모바일 환경 체크
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // 모바일이 아니면 리다이렉트
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      router.replace('/');
    }
  }, [isMobile, router]);

  // 로그인 상태 확인 (최소 구현)
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  React.useEffect(() => {
    if (isMounted) {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          setIsLoggedIn(true);
          setUserRole(decodedToken.role);
          setUserName(decodedToken.name);
        } catch (error) {
          setIsLoggedIn(false);
          setUserRole(null);
          setUserName(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);
      }
    }
  }, [isMounted]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    router.push('/');
  };

  if (!isMobile) return null;

  return (
    <div className="pt-14 pb-16">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-indigo-200 shadow-sm z-50">
        <div className="w-full px-0">
          <div className="relative flex items-center h-[90px] px-6">
            {/* 좌측: 검색(돋보기) 아이콘 */}
            <div className="flex-1 flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition"
                onClick={() => setShowSearchInput((v) => !v)}
                aria-label="검색"
              >
                <Search className="w-6 h-6 text-[#222]" />
              </button>
              {showSearchInput && (
                <input
                  type="text"
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="키워드 검색"
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { /* 검색 핸들러 */ setShowSearchInput(false); } }}
                  autoFocus
                  style={{ width: 180 }}
                />
              )}
            </div>
            {/* 중앙 로고 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => window.location.reload()}>
              <Image src="/images/Logo.png" alt="Cup Notes Seoul Logo" width={120} height={40} />
            </div>
            {/* 우측 아이콘 버튼 */}
            <div className="flex-1 flex justify-end items-center gap-2">
              {!isLoggedIn ? (
                <>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => router.push('/auth/login')}
                    aria-label="로그인"
                  >
                    <LogIn className="w-6 h-6 text-[#222]" />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={() => setIsSignupDropdownOpen((v) => !v)}
                    aria-label="회원가입"
                  >
                    <UserPlus className="w-6 h-6 text-[#222]" />
                  </button>
                  {isSignupDropdownOpen && (
                    <div className="absolute right-6 top-[90px] mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-[210] animate-fade-in">
                      <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={() => { setIsSignupDropdownOpen(false); router.push('/auth/signup'); }}>일반 회원가입</button>
                      <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={() => { setIsSignupDropdownOpen(false); router.push('/auth/manager/signup'); }}>카페 관리자 회원가입</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {userRole === 'cafeManager' || userRole === 'manager' ? (
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      onClick={() => router.push('/manager/dashboard')}
                      aria-label="내 카페 관리"
                    >
                      <Coffee className="w-6 h-6 text-[#222]" />
                    </button>
                  ) : null}
                  <span className="text-gray-700 text-sm font-medium mr-2">{userName}님</span>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={handleLogout}
                    aria-label="로그아웃"
                  >
                    <LogOut className="w-6 h-6 text-[#222]" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <FilterPanel
        selectedNotes={selectedNotes}
        toggleNote={note => setSelectedNotes(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note])}
        selectedBrewMethods={selectedBrewMethods}
        toggleBrewMethod={method => setSelectedBrewMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method])}
        selectedOrigins={selectedOrigins}
        toggleOrigin={origin => setSelectedOrigins(prev => prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin])}
        selectedProcesses={selectedProcesses}
        toggleProcess={process => setSelectedProcesses(prev => prev.includes(process) ? prev.filter(p => p !== process) : [...prev, process])}
        selectedRoast={selectedRoast}
        toggleRoast={roast => setSelectedRoast(prev => prev.includes(roast) ? prev.filter(r => r !== roast) : [...prev, roast])}
        onReset={() => {
          setSelectedNotes([]);
          setSelectedBrewMethods([]);
          setSelectedOrigins([]);
          setSelectedProcesses([]);
          setSelectedRoast([]);
        }}
        onApply={() => {}}
        mobileCombined={true}
      />
      <MobileNavBar />
    </div>
  );
} 