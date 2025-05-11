'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import CoffeeSearch from '../components/coffee/coffee-search';
import SearchResults from '../components/coffee/search-results';
import { SearchParams } from '../components/coffee/coffee-search';
import { Cafe } from '../types/types';
import { Search, Flower2, Apple, Candy, Coffee } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import FilterPanel from '../components/FilterPanel';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import MobileNavBar from '../components/MobileNavBar';

const Map = dynamic(() => import('../components/Map'), {
 ssr: false
});

declare global {
  interface Window {
    naver: any;
    currentMap: any;
  }
}

// QuickButton 컴포넌트 인라인 정의
function QuickButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      className="flex flex-col items-center px-2 py-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-semibold text-xs focus:outline-none min-w-[56px]"
      onClick={onClick}
      type="button"
    >
      <Image src={icon} alt={label} width={24} height={24} />
      <span className="mt-0.5" style={{letterSpacing: '0.01em'}}>{label}</span>
    </button>
  );
}

export default function HomePage() {
 const router = useRouter();
 const [cafes, setCafes] = useState<Cafe[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [sortOption, setSortOption] = useState('distance');
 const [showAllStores, setShowAllStores] = useState(true);
 const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
 const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
 const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
 const [selectedRoast, setSelectedRoast] = useState<string[]>([]);
 const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>([]);
 const [searchKeyword, setSearchKeyword] = useState<string>('');
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [userRole, setUserRole] = useState<string | null>(null);
 const [userName, setUserName] = useState<string | null>(null);
 const [userId, setUserId] = useState<string | null>(null);
 const [showMapOnMobile, setShowMapOnMobile] = useState(false);
 const [isSearching, setIsSearching] = useState(false);
 const [isMounted, setIsMounted] = useState(false);
 const [filters, setFilters] = useState({
   parking: false,
   wifi: false,
   outdoor: false,
   pet: false,
   smoking: false,
   wheelchair: false,
   floral: false,
   fruity: false,
   nutty: false
 });
 const { theme, setTheme } = useTheme();
 const [scrollProgress, setScrollProgress] = useState(0);
 const [isFilterOpen, setIsFilterOpen] = useState(false);
 const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false);
 const [isFiltersOpen, setIsFiltersOpen] = useState(false);
 const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
 const mapRef = useRef<any>(null);
 const [showMain, setShowMain] = useState(true);
 const [isMobile, setIsMobile] = useState(false);

 const hasSelections = selectedNotes.length > 0 || 
   selectedBrewMethods.length > 0 || 
   selectedOrigins.length > 0 || 
   selectedProcesses.length > 0 || 
   selectedRoast.length > 0;

 useEffect(() => {
  setIsMounted(true);
  console.log('isMounted true');
 }, []);

 useEffect(() => {
  // URL에서 토큰 파라미터 확인
    if (isMounted) {
  const params = new URLSearchParams(window.location.search);
  const tokenFromUrl = params.get('token');
  
  if (tokenFromUrl) {
    // 토큰을 localStorage에 저장
    localStorage.setItem('authToken', tokenFromUrl);
    
    // URL에서 토큰 파라미터 제거 (선택적)
    router.replace('/');
  }
  
  // localStorage에서 토큰 확인 (기존 로직)
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setIsLoggedIn(true);
      setUserRole(decodedToken.role);
      setUserId(decodedToken.id);
      
      // 사용자 정보 가져오기
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`/api/user/info`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.name) {
              setUserName(userData.name);
            } else if (userData && userData.email) {
              // 이름이 없으면 이메일의 @ 앞부분 사용
              const emailName = userData.email.split('@')[0];
              setUserName(emailName);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          
          // API 호출 실패 시 토큰에서 이메일 추출하여 표시
          if (decodedToken.email) {
            const emailName = decodedToken.email.split('@')[0];
            setUserName(emailName);
          }
        }
      };
      
      fetchUserInfo();
    } catch (error) {
      console.error('Token parsing error:', error);
    }
  }
    }
  }, [router, isMounted]);

 const handleLogout = () => {
   localStorage.removeItem('authToken');
   setIsLoggedIn(false);
   setUserRole(null);
   setUserName(null);
   setUserId(null);
   router.push('/');
 };

  useEffect(() => {
    // 페이지 첫 로딩 시에만 모든 카페 표시
    if (isMounted) {
      const initialLoad = async () => {
        setIsLoading(true);
        console.log('isLoading true (initialLoad)');
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
            console.log('cafes set:', data.cafes);
          }
        } catch (error) {
          console.error('초기 데이터 로딩 오류:', error);
          alert('카페 정보를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
          console.log('isLoading false (initialLoad)');
        }
      };

      initialLoad();
    }
  }, [isMounted]);

 const handleSearch = useCallback(async () => {
    if (!isMounted) return;
   setIsLoading(true);
    setIsSearching(true);
    console.log('[클라이언트] 검색 시작', { searchKeyword, selectedNotes, selectedOrigins, selectedProcesses, selectedRoast, selectedBrewMethods });
    try {
      const response = await fetch('/api/cafes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
       keyword: searchKeyword,
       notes: selectedNotes,
       origins: selectedOrigins,
       processes: selectedProcesses,
       roastLevel: selectedRoast,
       brewMethod: selectedBrewMethods,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '검색 중 오류가 발생했습니다.');
      }
 
     const data = await response.json();
      console.log('[클라이언트] API 응답:', data);

      if (!data.success) {
        throw new Error(data.error || '검색 결과를 가져오는데 실패했습니다.');
      }
 
     if (data && data.cafes) {
        console.log(`[클라이언트] 검색 결과: ${data.cafes.length}개의 카페 찾음`);
       setCafes(data.cafes);
        // 모바일 환경에서 검색 후 자동으로 지도 화면으로 전환
        if (window.innerWidth < 640) {
          setShowMapOnMobile(true);
        }
     } else {
        console.log('[클라이언트] 검색 결과 없음');
       setCafes([]);
     }
   } catch (error) {
      console.error('[클라이언트] 검색 오류:', error);
     setCafes([]);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
    setIsLoading(false);
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
    console.log('[클라이언트] 검색 완료');
  }, [searchKeyword, selectedNotes, selectedOrigins, selectedProcesses, selectedRoast, selectedBrewMethods, isMounted]);

 const clearSelections = () => {
   setSelectedNotes([]);
   setSelectedOrigins([]);
   setSelectedProcesses([]);
   setSelectedRoast([]);
   setSelectedBrewMethods([]);
    // 데스크톱에서만 자동 검색 실행
    if (isMounted && window.innerWidth >= 640) {
      handleSearch();
    }
 };

 const toggleNote = (note: string) => {
    setSelectedNotes(prev => 
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  const toggleBrewMethod = (method: string) => {
    setSelectedBrewMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const toggleOrigin = (origin: string) => {
    setSelectedOrigins(prev =>
      prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin]
    );
  };

  const toggleProcess = (process: string) => {
    setSelectedProcesses(prev =>
      prev.includes(process) ? prev.filter(p => p !== process) : [...prev, process]
    );
  };

  const toggleRoast = (roast: string) => {
    setSelectedRoast(prev =>
      prev.includes(roast) ? prev.filter(r => r !== roast) : [...prev, roast]
    );
  };

  const handleReset = () => {
    setSelectedNotes([]);
    setSelectedBrewMethods([]);
    setSelectedOrigins([]);
    setSelectedProcesses([]);
    setSelectedRoast([]);
  };

  const handleApply = () => {
    if (hasSelections) {
      const allSelections = [
        ...selectedNotes,
        ...selectedBrewMethods,
        ...selectedOrigins,
        ...selectedProcesses,
        ...selectedRoast
      ];
      setSearchKeyword(allSelections.join(' '));
      handleSearch();
    }
    setIsFilterOpen(false);
  };

  const handleCategorySearch = async (category: string) => {
    setIsLoading(true);
    let searchTerms: string[] = [];
    
    switch (category) {
      case 'floral':
        searchTerms = ['라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'];
        setSelectedNotes(searchTerms);
        break;
      case 'fruity':
        searchTerms = ['파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'];
        setSelectedNotes(searchTerms);
        break;
      case 'nutty':
        searchTerms = ['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스'];
        setSelectedNotes(searchTerms);
        break;
      case 'all':
        searchTerms = [];
        setSelectedNotes([]);
        break;
    }

    try {
      const response = await fetch('/api/cafes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: '',
          notes: searchTerms,
          origins: [],
          processes: [],
          roastLevel: [],
          brewMethod: [],
        }),
      });

      if (!response.ok) {
        throw new Error('검색 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      if (data && data.cafes) {
        setCafes(data.cafes);
      }
    } catch (error) {
      console.error('검색 오류:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 스크롤 프로그레스 계산
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalScroll) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 다크모드 버튼 핸들러
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 로그인/회원가입 버튼 핸들러
  const handleLogin = () => router.push('/auth/login');
  const handleSignup = () => setIsSignupDropdownOpen((v) => !v);
  const handleUserSignup = () => {
    setIsSignupDropdownOpen(false);
    router.push('/auth/signup');
  };
  const handleManagerSignup = () => {
    setIsSignupDropdownOpen(false);
    router.push('/auth/manager/signup');
  };

  // Map 렌더링 로그를 JSX 바깥에서 실행
  console.log('Map 렌더링', { cafes, searchKeyword });

  // 카페 선택 핸들러
  const handleCafeSelect = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowMain(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile(); // 초기 렌더링 시 체크
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 모바일 환경에서 히어로 화면이 끝나면 /map으로 이동
  useEffect(() => {
    if (isMobile && !showMain) {
      router.replace('/map');
    }
  }, [isMobile, showMain, router]);

  if (showMain) {
    return (
      <main className="min-h-screen transition-colors duration-300 overflow-y-auto">
        {/* 헤더 섹션 */}
        <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-indigo-200 shadow-sm z-50">
          <div className="w-full px-0">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4 ml-8">
                <button
                  className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-lg select-none focus:outline-none"
                  onClick={() => window.location.reload()}
                  aria-label="홈 새로고침"
                  type="button"
                >
                  CUP NOTES SEOUL
                </button>
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 via-indigo-400 to-yellow-300 shadow-md ml-2 animate-pulse"></span>
              </div>
            </div>
          </div>
        </header>
        <section className="flex flex-col items-center justify-center min-h-screen pt-16 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 text-center"
          >
            <span className="block">평범한 하루도</span>
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center"
          >
            <span className="block">한 잔의 커피로 특별해질 수 있어요.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-lg md:text-xl text-gray-700 mb-8 text-center"
          >
            당신의 컵노트를 검색하세요.
          </motion.p>
        </section>
      </main>
    );
  }

  // 모바일 환경에서 히어로 화면이 끝나면 아무것도 렌더하지 않음
  if (isMobile && !showMain) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F5F2E8] dark:bg-gray-900 transition-colors duration-300 overflow-y-auto">
      {/* 스크롤 프로그레스 바 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50"
        style={{ scaleX: scrollProgress / 100, transformOrigin: '0%' }}
      />

      {/* 헤더 섹션 */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-indigo-200 shadow-sm z-[100]">
        <div className="w-full px-0">
          <div className="flex justify-between items-center h-16">
            {/* 감각적인 로고/텍스트 */}
            <div className="flex items-center space-x-4 ml-8">
              <button
                className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-lg select-none focus:outline-none"
                onClick={() => window.location.reload()}
                aria-label="홈 새로고침"
                type="button"
              >
                CUP NOTES SEOUL
              </button>
              <span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 via-indigo-400 to-yellow-300 shadow-md ml-2 animate-pulse"></span>
            </div>
            {/* 네비게이션(로그인/회원가입/내카페/로그아웃만) */}
            <nav className="flex items-center space-x-6 relative pr-12">
              {!isLoggedIn && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={handleLogin}
                  >
                    로그인
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={handleSignup}
                  >
                    회원가입
                  </motion.button>
                  {isSignupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                      <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={handleUserSignup}>일반 회원가입</button>
                      <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 text-gray-800" onClick={handleManagerSignup}>카페 관리자 회원가입</button>
                    </div>
                  )}
                </>
              )}
              {isLoggedIn && (
                <>
                  {(userRole === 'cafeManager' || userRole === 'manager') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                      onClick={() => router.push('/manager/dashboard')}
                    >
                      내 카페 관리
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </motion.button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-40 md:hidden"
          >
            <div className="container mx-auto py-4 px-4 space-y-4">
              {!isLoggedIn && (
                <>
                  <button className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={handleLogin}>
                    로그인
                  </button>
                  <button className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={handleSignup}>
                    회원가입
                  </button>
                  {isSignupDropdownOpen && (
                    <div className="mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                      <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={handleUserSignup}>일반 회원가입</button>
                      <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100" onClick={handleManagerSignup}>카페 관리자 회원가입</button>
                    </div>
                  )}
                </>
              )}
              {isLoggedIn && (
                <>
                  {userRole === 'cafeManager' || userRole === 'manager' ? (
                    <button
                      className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => router.push('/manager/dashboard')}
                    >
                      내 카페 관리
                    </button>
                  ) : null}
                  <button
                    className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 필터 패널 항상 렌더 */}
      {/* 메인 컨텐츠 */}
      <div className="pt-16">
        {/* 지도 섹션 */}
        <section id="map-section" className="relative w-full h-[calc(100vh-4rem)]">
          {/* Quick Box: FilterPanel 오른쪽 경계에서 왼쪽 16px, 위쪽 8px */}
          <div
            className="absolute z-[120] bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl flex gap-1 px-2 py-1 items-center"
            style={{ left: isMobile ? '16px' : 'calc(384px + 16px)', top: '8px', minWidth: 240, maxWidth: 320 }}
          >
            <QuickButton
              icon="/images/Floralicon.png"
              label="Floral"
              onClick={() => handleCategorySearch('floral')}
            />
            <QuickButton
              icon="/images/Fruityicon.png"
              label="Fruity"
              onClick={() => handleCategorySearch('fruity')}
            />
            <QuickButton
              icon="/images/Nuttyicon.png"
              label="Nutty"
              onClick={() => handleCategorySearch('nutty')}
            />
            <QuickButton
              icon="/images/handdripicon.png"
              label="핸드드립"
              onClick={() => handleCategorySearch('핸드드립')}
            />
          </div>
          {/* FilterPanel 항상 좌측에 고정 */}
          {!isMobile && (
            <FilterPanel
              selectedNotes={selectedNotes}
              toggleNote={toggleNote}
              selectedBrewMethods={selectedBrewMethods}
              toggleBrewMethod={toggleBrewMethod}
              selectedOrigins={selectedOrigins}
              toggleOrigin={toggleOrigin}
              selectedProcesses={selectedProcesses}
              toggleProcess={toggleProcess}
              selectedRoast={selectedRoast}
              toggleRoast={toggleRoast}
              onReset={handleReset}
              onApply={handleApply}
              className="fixed top-16 left-0 w-96 h-[calc(100vh-4rem)] z-50"
            />
          )}
          {/* Map 영역: FilterPanel 너비만큼 오른쪽으로 밀기 */}
          <div className={`ml-${isMobile ? '0' : '96'} h-full`}>
            {/* 현재위치 버튼: 아이콘, 우측 중하단 고정 */}
            <button
              className="fixed right-6 bottom-24 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-100 transition-colors border border-gray-200"
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
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
                <circle cx="12" cy="12" r="4" fill="#3b82f6" />
              </svg>
            </button>
            {/* 지도 컴포넌트 */}
            <Map
              ref={mapRef}
              cafes={cafes}
              onCafeSelect={handleCafeSelect}
              searchKeyword={searchKeyword}
              onSearch={handleSearch}
            />
          </div>
        </section>
      </div>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-xs text-gray-600">© 2025 Cup Notes. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-xs">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 text-xs">Terms of Service</Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-xs">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      {isMobile && <MobileNavBar />}
    </main>
  );
}