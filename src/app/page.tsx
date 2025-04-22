'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CoffeeSearch from '../components/coffee/coffee-search';
import SearchResults from '../components/coffee/search-results';
import { SearchParams } from '../components/coffee/coffee-search';
import { Cafe } from '../types/types';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

  const hasSelections = selectedNotes.length > 0 || 
    selectedBrewMethods.length > 0 || 
    selectedOrigins.length > 0 || 
    selectedProcesses.length > 0 || 
    selectedRoast.length > 0;

  useEffect(() => {
    setIsMounted(true);
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
          alert('카페 정보를 불러오는데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };

      initialLoad();
    }
  }, [isMounted]);

  const handleSearch = useCallback(async () => {
    if (!isMounted) return;
    
    setIsLoading(true);
    setIsSearching(true);
    console.log('[클라이언트] 검색 시작');
    
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
      // 사용자에게 오류 메시지 표시
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSearching(false);
      }, 1000);
      console.log('[클라이언트] 검색 완료');
    }
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
      prev.includes(note)
        ? prev.filter(n => n !== note)
        : [...prev, note]
    );
  };

  const toggleItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  // 모바일에서 지도 <-> 필터 토글
  const toggleMapView = () => {
    setShowMapOnMobile(prev => !prev);
  };

  // Map 컴포넌트에 전달하기 전에 타입 변환
  const processedCafes = cafes.map(cafe => ({
    ...cafe,
    description: cafe.description ?? null,
    imageUrl: cafe.imageUrl ?? null,
    businessHourNote: cafe.businessHourNote ?? null,
    adminId: cafe.adminId ?? null,
    managerId: cafe.managerId ?? null,
    businessHours: JSON.parse(JSON.stringify(cafe.businessHours || [])),
    snsLinks: JSON.parse(JSON.stringify(cafe.snsLinks || [])),
  }));

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
  };

  return (
    <div className="min-h-screen bg-[#F5F2E8]">
      {/* 왼쪽 절반 영역 컨테이너 */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen relative bg-[#F5F2E8] z-[60]">
        {/* 상단 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 sm:px-8 py-4 sm:py-6 bg-[#F5F2E8] z-[70] fixed w-full lg:w-1/2 top-0">
          <div className="flex items-center">
            <h1 
              onClick={() => window.location.reload()}
              className="text-5xl sm:text-6xl font-black tracking-tighter cursor-pointer text-[#F15A2B] hover:text-[#d14d24] transition-colors text-left font-sans leading-none"
            >
              CUP NOTES SEOUL
            </h1>
          </div>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            {isLoggedIn ? (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
              >
                {userName}님
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* 회원가입 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">회원 유형 선택</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <Link
                  href="/auth/signup"
                  className="block w-full py-3 px-4 text-center bg-[#F15A2B] text-[#F5F2E8] rounded-lg hover:bg-[#d14d24] transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  일반 회원가입
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">또는</span>
                  </div>
                </div>

                <Link
                  href="/auth/manager/signup"
                  className="block w-full py-3 px-4 text-center border border-[#F15A2B] text-[#F15A2B] rounded-lg hover:bg-[#d14d24] transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  카페 매니저 회원가입
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 검색어 및 내 취향 선택 섹션 */}
        <div className="p-6 sm:p-8 space-y-8 flex-grow bg-[#F5F2E8] mt-20 sm:mt-24">
          {/* Coffee Filters 섹션 */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-[#F15A2B] tracking-tight uppercase leading-none">Coffee Filters</h2>
            <div className="flex flex-col gap-3">
              {/* 추출방식 */}
              <div className="bg-gray-100 p-5 rounded">
                <h4 className="text-sm font-medium text-[#F15A2B] mb-3 uppercase tracking-wider">Brew Method</h4>
                <div className="flex flex-wrap gap-2">
                  {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                    <button
                      key={method}
                      onClick={() => toggleItem(method, setSelectedBrewMethods)}
                      className={`text-xs px-3 py-1.5 rounded-sm transition-all ${
                        selectedBrewMethods.includes(method) 
                          ? 'bg-[#F15A2B] text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-[#F15A2B] hover:border-[#F15A2B] hover:shadow-sm'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              {/* 원산지 */}
              <div className="bg-gray-100 p-5 rounded">
                <h4 className="text-sm font-medium text-[#F15A2B] mb-3 uppercase tracking-wider">Origin</h4>
                <div className="flex flex-wrap gap-2">
                  {['에티오피아', '콜롬비아', '과테말라', '코스타리카', '파나마', '인도네시아', '브라질', '케냐', '엘살바도르', '르완다'].map((origin) => (
                    <button
                      key={origin}
                      onClick={() => toggleItem(origin, setSelectedOrigins)}
                      className={`text-xs px-3 py-1.5 rounded-sm transition-all ${
                        selectedOrigins.includes(origin) 
                          ? 'bg-[#F15A2B] text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-[#F15A2B] hover:border-[#F15A2B] hover:shadow-sm'
                      }`}
                    >
                      {origin}
                    </button>
                  ))}
                </div>
              </div>
              {/* 프로세스 */}
              <div className="bg-gray-100 p-5 rounded">
                <h4 className="text-sm font-medium text-[#F15A2B] mb-3 uppercase tracking-wider">Process</h4>
                <div className="flex flex-wrap gap-2">
                  {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                    <button
                      key={process}
                      onClick={() => toggleItem(process, setSelectedProcesses)}
                      className={`text-xs px-3 py-1.5 rounded-sm transition-all ${
                        selectedProcesses.includes(process) 
                          ? 'bg-[#F15A2B] text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-[#F15A2B] hover:border-[#F15A2B] hover:shadow-sm'
                      }`}
                    >
                      {process}
                    </button>
                  ))}
                </div>
              </div>
              {/* 로스팅 포인트 */}
              <div className="bg-gray-100 p-5 rounded">
                <h4 className="text-sm font-medium text-[#F15A2B] mb-3 uppercase tracking-wider">Roasting Point</h4>
                <div className="flex flex-wrap gap-2">
                  {['다크', '미디엄다크', '미디엄', '미디엄라이트', '라이트'].map((roast) => (
                    <button
                      key={roast}
                      onClick={() => toggleItem(roast, setSelectedRoast)}
                      className={`text-xs px-3 py-1.5 rounded-sm transition-all ${
                        selectedRoast.includes(roast) 
                          ? 'bg-[#F15A2B] text-white shadow-sm' 
                          : 'bg-white border border-gray-200 text-[#F15A2B] hover:border-[#F15A2B] hover:shadow-sm'
                      }`}
                    >
                      {roast}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* My Cup Notes 섹션 */}
          <section className="space-y-6 mt-12">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-[#F15A2B] tracking-tight uppercase leading-none">My Cup Notes</h2>
              <div className="flex gap-6">
                <button
                  onClick={handleReset}
                  className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Floral Section */}
              <div className="relative h-[300px] overflow-hidden group">
                <div className="absolute inset-0">
                  <Image
                    src="/images/Floral.jpg"
                    alt="Floral background"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
                <div className="absolute inset-0 p-6 flex flex-col">
                  <h3 className="text-xl font-light text-white mb-6">Floral</h3>
                  <div className="flex flex-wrap gap-2 content-start">
                    {['라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`text-xs px-3 py-1.5 transition-colors ${
                          selectedNotes.includes(note)
                            ? 'bg-white text-gray-900'
                            : 'bg-black/40 text-white hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fruity Section */}
              <div className="relative h-[300px] overflow-hidden group">
                <div className="absolute inset-0">
                  <Image
                    src="/images/Fruity.jpg"
                    alt="Fruity background"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
                <div className="absolute inset-0 p-6 flex flex-col">
                  <h3 className="text-xl font-light text-white mb-6">Fruity</h3>
                  <div className="flex flex-wrap gap-2 content-start">
                    {['파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`text-xs px-3 py-1.5 transition-colors ${
                          selectedNotes.includes(note)
                            ? 'bg-white text-gray-900'
                            : 'bg-black/40 text-white hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutty Section */}
              <div className="relative h-[300px] overflow-hidden group">
                <div className="absolute inset-0">
                  <Image
                    src="/images/Nutty.jpg"
                    alt="Nutty background"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
                <div className="absolute inset-0 p-6 flex flex-col">
                  <h3 className="text-xl font-light text-white mb-6">Nutty</h3>
                  <div className="flex flex-wrap gap-2 content-start">
                    {['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스'].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`text-xs px-3 py-1.5 transition-colors ${
                          selectedNotes.includes(note)
                            ? 'bg-white text-gray-900'
                            : 'bg-black/40 text-white hover:bg-white hover:text-gray-900'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-[#F5F2E8] py-4 px-8 text-center w-full z-10 hidden sm:block mt-auto border-t border-gray-100">
          <p className="text-xs text-[#F15A2B] tracking-wide">
            © 2024 Cup Notes Seoul. All rights reserved.
          </p>
        </footer>
      </div>

      {/* 오른쪽 지도 영역 */}
      <div className={`
        ${showMapOnMobile ? 'fixed inset-0 z-[99999]' : 'hidden lg:block'}
        lg:w-1/2 lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:z-[40] lg:h-screen
      `}>
        <Map cafes={processedCafes} searchKeyword={searchKeyword} />
      </div>

      {/* 모바일 하단 네비게이션 바 */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#F5F2E8] border-t border-gray-100 z-50">
        <div className="flex justify-around items-center h-14">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
            >
              Sign Out
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-[#F15A2B] hover:text-[#d14d24] transition-colors tracking-wide uppercase"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}