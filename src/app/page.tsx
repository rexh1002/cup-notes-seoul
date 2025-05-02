'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import CoffeeSearch from '../components/coffee/coffee-search';
import SearchResults from '../components/coffee/search-results';
import { SearchParams } from '../components/coffee/coffee-search';
import { Cafe } from '../types/types';
import { Search, Flower2, Grape, Nut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import FilterPanel from '../components/FilterPanel';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const Map = dynamic(() => import('../components/Map'), {
 ssr: false
});

declare global {
  interface Window {
    naver: any;
    currentMap: any;
  }
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

  if (showMain) {
    return (
      <main className="min-h-screen bg-[#F5F2E8] dark:bg-gray-900 transition-colors duration-300 overflow-y-auto">
        {/* 헤더 섹션 */}
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
          <div className="w-full px-0">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4 mr-20">
                <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-indigo-700">
                  CUP NOTES SEOUL
                </Link>
              </div>
              {/* ...기존 네비게이션 코드... */}
            </div>
          </div>
        </header>
        <section className="flex flex-col items-center justify-center min-h-screen pt-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 text-center">당신의 완벽한 커피를 찾아보세요</h1>
          <p className="text-lg text-gray-700 mb-8 text-center">서울의 숨은 커피 명소들을 발견하고 공유하세요</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F2E8] dark:bg-gray-900 transition-colors duration-300 overflow-y-auto">
      {/* 스크롤 프로그레스 바 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-50"
        style={{ scaleX: scrollProgress / 100, transformOrigin: '0%' }}
      />

      {/* 헤더 섹션 */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="w-full px-0">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 mr-20">
              <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl text-indigo-700">
                CUP NOTES SEOUL
              </Link>
            </div>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-6 relative pr-12">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={handleThemeToggle}
              >
                {theme === 'dark' ? '라이트 모드' : '다크 모드'}
              </motion.button>
              {!isLoggedIn && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={handleLogin}
                  >
                    로그인
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={handleSignup}
                  >
                    회원가입
                  </motion.button>
                  {/* 회원가입 드롭다운 */}
                  {isSignupDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
        <button 
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                      onClick={handleUserSignup}
        >
                      일반 회원가입
        </button>
        <button 
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                      onClick={handleManagerSignup}
        >
                      카페 관리자 회원가입
        </button>
      </div>
                )}
                </>
              )}
              {isLoggedIn && (
                <>
                  {userRole === 'cafeManager' || userRole === 'manager' ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => router.push('/manager/dashboard')}
                    >
                      내 카페 관리
                    </motion.button>
                  ) : null}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </motion.button>
                </>
              )}
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </motion.button>
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
                        <button
                className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={handleThemeToggle}
              >
                {theme === 'dark' ? '라이트 모드' : '다크 모드'}
              </button>
              {!isLoggedIn && (
                <>
                  <button className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={handleLogin}>
                    로그인
                  </button>
                  <button className="w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={handleSignup}>
                    회원가입
                        </button>
                  {/* 모바일 회원가입 드롭다운 */}
                  {isSignupDropdownOpen && (
                    <div className="mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
                        <button
                        className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                        onClick={handleUserSignup}
                      >
                        일반 회원가입
                        </button>
                        <button
                        className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                        onClick={handleManagerSignup}
                      >
                        카페 관리자 회원가입
                        </button>
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
        {/* 히어로 섹션 */}
        <section className="relative h-screen overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"
          />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6 px-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white"
              >
                당신의 완벽한 커피를 찾아보세요
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-700 dark:text-gray-300"
              >
                서울의 숨은 커피 명소들을 발견하고 공유하세요
              </motion.p>
                </div>
              </div>

          {/* 스크롤 다운 인디케이터 */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 cursor-pointer"
            onClick={() => {
              const mapSection = document.getElementById('map-section');
              if (mapSection) {
                mapSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </section>

        {/* 지도 섹션 */}
        <section id="map-section" className="relative w-full h-[calc(100vh-4rem)]">
          {/* 필터 버튼 */}
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="absolute top-20 left-4 z-50 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">필터 설정</span>
          </button>

          {/* 바로가기 버튼들 */}
          <div className="fixed bottom-2 left-0 right-0 z-50 flex gap-1 px-1 w-full overflow-x-auto whitespace-nowrap sm:gap-1">
            <button
              onClick={() => handleCategorySearch('floral')}
              className="min-w-[44px] h-10 flex items-center justify-center rounded-full bg-white shadow text-xl sm:text-base"
            >
              <span className="text-gray-800 font-medium text-base hidden sm:inline">🌸</span>
            </button>
            <button
              onClick={() => handleCategorySearch('fruity')}
              className="min-w-[44px] h-10 flex items-center justify-center rounded-full bg-white shadow text-xl sm:text-base"
            >
              <span className="text-gray-800 font-medium text-base hidden sm:inline">🍇</span>
            </button>
            <button
              onClick={() => handleCategorySearch('nutty')}
              className="min-w-[44px] h-10 flex items-center justify-center rounded-full bg-white shadow text-xl sm:text-base"
            >
              <span className="text-gray-800 font-medium text-base hidden sm:inline">🥜</span>
            </button>
            <button
              onClick={() => handleCategorySearch('handdrip')}
              className="min-w-[44px] h-10 flex items-center justify-center rounded-full bg-white shadow text-xl sm:text-base"
            >
              <span className="text-gray-800 font-medium text-base hidden sm:inline">☕️</span>
            </button>
          </div>

          {/* 현재위치 버튼 */}
          <button
            className="min-w-[44px] h-10 flex items-center justify-center rounded-full bg-white shadow text-xl sm:text-base"
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
          >
            <span className="hidden sm:inline">현재위치</span>
          </button>

          {/* FilterPanel 컴포넌트 */}
          <FilterPanel
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
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
          />

          {/* 지도 컴포넌트 */}
          <Map
            ref={mapRef}
            cafes={cafes}
            onCafeSelect={handleCafeSelect}
            searchKeyword={searchKeyword}
            onSearch={handleSearch}
          />
        </section>
      </div>

      {/* 푸터 */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Cup Notes. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </a>
        </div>
      </div>
    </div>
    </footer>
    </main>
  );
}