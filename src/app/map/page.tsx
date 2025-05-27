'use client';
import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Search, Coffee, LogIn, UserPlus, LogOut } from 'lucide-react';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

const CATEGORY_LIST = [
  { key: 'floral', label: '플로럴', image: '/images/Floralicon.png' },
  { key: 'fruity', label: '프루티', image: '/images/Fruityicon.png' },
  { key: 'nutty', label: '너티', image: '/images/Nuttyicon.png' },
  { key: 'handdrip', label: '핸드드립', image: '/images/handdripicon.png' },
];

function QuickCard({ image, label, onClick }: { image: string; label: string; onClick: () => void }) {
  return (
    <button
      className="flex flex-row items-center justify-center flex-shrink-0 min-w-fit rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-medium text-sm px-3 py-1.5 gap-2 whitespace-nowrap"
      onClick={onClick}
      type="button"
    >
      <Image src={image} alt={label} width={16} height={16} />
      <span>{label}</span>
    </button>
  );
}

export default function MapMobilePage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [cafes, setCafes] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<any | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 초기 카페 데이터 로딩
  useEffect(() => {
    if (isMounted) {
      const initialLoad = async () => {
        try {
          const response = await fetch('/api/cafes/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              keyword: '',
              notes: [],
              origins: [],
              processes: [],
              roastLevel: [],
              brewMethod: [],
            }),
          });

          if (!response.ok) {
            throw new Error('초기 데이터를 불러오는데 실패했습니다.');
          }

          const data = await response.json();
          if (data && data.cafes) {
            setCafes(data.cafes);
          }
        } catch (error) {
          console.error('초기 데이터 로딩 오류:', error);
        }
      };

      initialLoad();
    }
  }, [isMounted]);

  useEffect(() => {
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

  // 모바일 환경이 아니면 리다이렉트
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    router.replace('/');
    return null;
  }

  // 검색 핸들러
  const handleSearch = async () => {
    // 검색 API 호출 및 결과 setCafes
  };

  // 카테고리 퀵서치 핸들러
  const handleCategorySearch = (category: string) => {
    // 카테고리별 검색 API 호출 및 결과 setCafes
  };

  const handleCafeClick = (cafe: any) => {
    setSelectedCafe(cafe);
  };

  return (
    <div className="relative w-full min-h-screen pt-14 pb-16">
      {/* 모바일: 헤더 아래 검색 입력칸 */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div className="fixed top-[2px] left-0 right-0 z-[110] bg-white px-4 py-2 border-b border-gray-100 flex items-center gap-2" style={{boxShadow:'0 2px 8px 0 rgba(0,0,0,0.03)'}}>
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-[#f7f7f7] text-base font-sans focus:outline-none focus:ring-2 focus:ring-bluebottle-blue transition placeholder:text-gray-400"
            placeholder="카페, 키워드 검색"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { handleSearch(); } }}
            style={{minWidth:0}}
          />
          <button
            className="ml-2 px-3 py-2 bg-bluebottle-blue text-white rounded-lg font-bold text-sm shadow-sm hover:bg-[#004b82] transition"
            onClick={handleSearch}
            aria-label="검색"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* 모바일 지도 QuickButton 그룹 중앙 상단 가로 배치 */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div className="fixed top-20 left-0 right-0 z-[110] w-full max-w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <style>{`div[role='quick-scroll']::-webkit-scrollbar { display: none; }`}</style>
          <div role="quick-scroll" className="flex flex-row gap-2 items-center pl-2 pr-2" style={{scrollbarWidth:'none'}}>
            {CATEGORY_LIST.map(cat => (
              <QuickCard key={cat.key} image={cat.image} label={cat.label} onClick={() => handleCategorySearch(cat.key)} />
            ))}
          </div>
        </div>
      )}
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
                  onKeyDown={e => { if (e.key === 'Enter') { handleSearch(); setShowSearchInput(false); } }}
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
                    onClick={() => { localStorage.removeItem('authToken'); setIsLoggedIn(false); setUserRole(null); setUserName(null); router.push('/'); }}
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
      {/* 지도 영역 */}
      <div className="absolute inset-0" style={{ zIndex: 100 }}>
        {/* 현재위치 버튼 */}
        <button
          className="fixed right-6 bottom-24 z-[100] w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-100 transition-colors border border-gray-200"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  if (mapRef.current && typeof mapRef.current.moveToCurrentLocation === 'function') {
                    mapRef.current.moveToCurrentLocation(latitude, longitude);
                  } else {
                    window.alert('지도를 찾을 수 없습니다.');
                  }
                },
                (error) => {
                  window.alert('현재 위치를 가져올 수 없습니다. 위치 권한을 허용해 주세요.');
                }
              );
            } else {
              window.alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
            }
          }}
          aria-label="현재위치"
        >
          {/* 네이버지도 스타일 십자형 원형 아이콘 */}
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </button>

        {/* 지도 컴포넌트 */}
        <Map ref={mapRef} cafes={cafes} />
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[160]">
        <MobileNavBar />
      </div>
    </div>
  );
} 