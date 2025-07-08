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
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          if (decodedToken.name) {
            setUserName(decodedToken.name);
          } else if (decodedToken.email) {
            const emailName = decodedToken.email.split('@')[0];
            setUserName(emailName);
          }
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
    if (!confirm('로그아웃 하시겠습니까?')) {
      return;
    }
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    alert('로그아웃 되었습니다.');
    router.push('/');
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 회원탈퇴를 하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const apiUrl = (userRole === 'manager' || userRole === 'cafeManager')
        ? '/api/manager/delete'
        : '/api/user/delete';

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);
        alert('회원탈퇴가 완료되었습니다.');
        router.push('/');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '회원탈퇴 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      alert('회원탈퇴 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchAutocomplete = async (keyword: string) => {
    if (!keyword) { setAutocomplete([]); setShowAutocomplete(false); return; }
    try {
      const response = await fetch('/api/cafes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });
      if (!response.ok) return;
      const data = await response.json();
      // 예시: cafeNames, notes, origins, processes, roastLevel 등에서 추천 키워드 추출
      const keywords = [
        ...(data.cafeNames || []),
        ...(data.notes || []),
        ...(data.origins || []),
        ...(data.processes || []),
        ...(data.roastLevel || [])
      ].filter(Boolean);
      setAutocomplete(keywords.slice(0, 10));
      setShowAutocomplete(true);
    } catch (e) {
      setAutocomplete([]);
      setShowAutocomplete(false);
    }
  };

  if (!isMobile) return null;

  return (
    <div className="pt-14 pb-16">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-indigo-200 shadow-sm z-50">
        <div className="w-full px-0">
          <div className="relative flex items-center h-[90px] px-6">
            {/* 좌측: 회원이름 */}
            <div className="flex-1 flex items-center gap-2">
              {isLoggedIn && (
                <span className="text-gray-700 text-sm font-medium mr-2">{userName}님</span>
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
                      className="p-2 border border-gray-300 bg-white text-[#222] font-bold text-xs w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition rounded-none"
                      onClick={() => router.push('/manager/dashboard')}
                      aria-label="내 카페 관리"
                    >
                      My Cafe
                    </button>
                  ) : null}
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
          {/* 헤더 검색 입력창에 자동완성 추가 */}
          {showSearchInput && (
            <div className="relative">
              <input
                type="text"
                className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="키워드 검색"
                value={searchKeyword}
                onChange={e => { setSearchKeyword(e.target.value); fetchAutocomplete(e.target.value); }}
                onFocus={() => { if (autocomplete.length) setShowAutocomplete(true); }}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter') { /* 검색 실행 */ setShowAutocomplete(false); } }}
                autoFocus
                style={{ width: 180 }}
              />
              {showAutocomplete && autocomplete.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-[200] max-h-48 overflow-y-auto">
                  {autocomplete.map((item, idx) => (
                    <div
                      key={item + idx}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                      onMouseDown={() => { setSearchKeyword(item); setShowAutocomplete(false); }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
        onApply={() => {
          // 모바일에서만 동작
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            const params = new URLSearchParams();
            if (selectedNotes.length) params.append('notes', selectedNotes.join(','));
            if (selectedBrewMethods.length) params.append('brewMethods', selectedBrewMethods.join(','));
            if (selectedOrigins.length) params.append('origins', selectedOrigins.join(','));
            if (selectedProcesses.length) params.append('processes', selectedProcesses.join(','));
            if (selectedRoast.length) params.append('roast', selectedRoast.join(','));
            router.push(`/map?${params.toString()}`);
          }
        }}
        mobileCombined={true}
        isLoggedIn={isLoggedIn}
        onDeleteAccount={handleDeleteAccount}
        isDeleting={isDeleting}
      />
      <MobileNavBar />
    </div>
  );
} 