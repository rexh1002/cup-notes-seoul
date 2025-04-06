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

  useEffect(() => {
    // URL에서 토큰 파라미터 확인
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
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName(null);
    setUserId(null);
    router.push('/');
  };

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setIsSearching(true);
    // 모바일에서만 적용 버튼 클릭 시 지도로 전환
    if (window.innerWidth < 640) {
      setShowMapOnMobile(true);
    }
    try {
      const searchParams: SearchParams = {
        keyword: searchKeyword,
        notes: selectedNotes,
        origins: selectedOrigins,
        processes: selectedProcesses,
        roastLevel: selectedRoast,
        brewMethod: selectedBrewMethods,
      };
  
      const response = await fetch('/api/cafes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
  
      const data = await response.json();
  
      if (data && data.cafes) {
        setCafes(data.cafes);
      } else {
        setCafes([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setCafes([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsSearching(false);
      }, 1000);
    }
  }, [searchKeyword, selectedNotes, selectedOrigins, selectedProcesses, selectedRoast, selectedBrewMethods]);

  useEffect(() => {
    // 데스크톱에서만 자동 검색 실행
    if (window.innerWidth >= 640) {
      handleSearch();
    }
  }, [handleSearch]);

  useEffect(() => {
    if (showAllStores) {
      // 데스크톱에서만 자동 검색 실행
      if (window.innerWidth >= 640) {
        handleSearch();
      }
    } else {
      setCafes([]);
    }
  }, [showAllStores, handleSearch]);

  const clearSelections = () => {
    setSelectedNotes([]);
    setSelectedOrigins([]);
    setSelectedProcesses([]);
    setSelectedRoast([]);
    setSelectedBrewMethods([]);
    // 데스크톱에서만 자동 검색 실행
    if (window.innerWidth >= 640) {
      handleSearch();
    }
  };

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const toggleItem = (
    item: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // 모바일에서 지도 <-> 필터 토글
  const toggleMapView = () => {
    setShowMapOnMobile(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white shadow-sm">
        <h1 
          onClick={() => window.location.reload()}
          className="text-3xl sm:text-4xl font-bold tracking-tight cursor-pointer hover:text-gray-700 transition-colors mb-2 sm:mb-0"
        >
          CUP NOTES SEOUL
        </h1>

        {/* 로그인/회원가입 버튼 그룹 - 모바일에서는 숨김 */} 
        <div className="hidden sm:flex items-center font-sans w-full sm:w-auto justify-center sm:justify-end">   
          {isLoggedIn ? (     
            <>       
              {userName && (         
                <span className="text-black font-normal text-xs px-2 py-1">           
                  {userName} 님         
                </span>       
              )}              
              
              <div className="h-4 w-px bg-gray-300 mx-0.75"></div>              
              
              <button         
                onClick={handleLogout}         
                className="px-2 py-1 text-black font-bold hover:text-gray-700 transition-colors text-xs"       
              >         
                LOGOUT       
              </button>              
              
              {userRole === 'manager' || userRole === 'cafeManager' ? (         
                <>           
                  <div className="h-4 w-px bg-gray-300 ml-0.75 mr-1.5"></div>           
                  <Link             
                    href="/manager/dashboard"             
                    className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors text-xs font-bold"           
                  >             
                    내 카페 관리           
                  </Link>         
                </>       
              ) : null}     
            </>   
          ) : (     
            <>       
              <Link         
                href="/auth/login"         
                className="px-2 py-1 text-black font-bold hover:text-gray-700 transition-colors text-xs"       
              >         
                LOGIN       
              </Link>        
              
              <div className="h-4 w-px bg-gray-300 mx-0.75"></div>        
              
              <button          
                onClick={() => setIsModalOpen(true)}         
                className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors text-xs font-bold"       
              >         
                SIGN UP       
              </button>     
            </>   
          )} 
        </div>
      </div>

      {/* 회원가입 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">회원가입</h2>
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
                className="block w-full py-3 px-4 text-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                className="block w-full py-3 px-4 text-center border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                카페 매니저 회원가입
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 검색어 및 내 취향 선택 섹션 - 모바일에서 상단 고정 */}
      <div className={`bg-white p-4 border-b sticky top-0 z-50 ${showMapOnMobile ? 'hidden sm:block' : ''}`}>
        {/* 첫 번째 줄: 옵션 선택 제목과 버튼들 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-lg font-medium">내 취향 선택</span>
          <div className="flex gap-2">
            <button 
              onClick={clearSelections} 
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            >
              선택해제
            </button>
            <button 
              onClick={handleSearch} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={isSearching}
            >
              {isSearching ? '내 취향의 카페를 찾습니다...' : '적용'}
            </button>
          </div>

          {/* 검색창 - 모바일에서는 전체 너비 */}
          <div className="relative w-full sm:w-auto sm:ml-6 mt-2 sm:mt-0">
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="border rounded-full px-4 py-2 text-sm w-full sm:w-64 pr-10"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <Search className="w-4 h-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>
        
        {/* 두 번째 줄: 체크박스 - 숨김 처리하고 기능만 유지 */}
        <div className="hidden">
          <input
            type="checkbox"
            checked={showAllStores}
            onChange={() => setShowAllStores((prev) => !prev)}
          />
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-col lg:flex-row flex-grow">
        {/* 왼쪽 컨텐츠 - 모바일에서는 조건부 표시 */}
        <div className={`w-full lg:w-1/2 flex flex-col ${showMapOnMobile ? 'hidden sm:flex' : ''}`}>
          <div className="p-4 sm:p-6 space-y-6 flex-grow">
            {/* 컵노트 이미지 및 필터 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">컵노트</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Floral Section */}
                <div className="relative">
                  <Image
                    src="/images/Floral.jpg"
                    alt="Floral"
                    width={400}
                    height={240}
                    className="w-full h-60 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-4 rounded-lg">
                    <h3 className="text-white text-lg font-bold">Floral</h3>
                    <div className="overflow-y-auto max-h-[180px] scrollbar-hide mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {['라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'].map((note) => (
                          <button
                            key={note}
                            onClick={() => toggleNote(note)}
                            className={`text-xs border border-white px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                              selectedNotes.includes(note)
                                ? 'bg-white text-black'
                                : 'bg-transparent text-white opacity-90 hover:opacity-100'
                            } hover:scale-105 active:scale-95`}
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fruity Section */}
                <div className="relative">
                  <Image
                    src="/images/Fruity.jpg"
                    alt="Fruity"
                    width={400}
                    height={240}
                    className="w-full h-60 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-4 rounded-lg">
                    <h3 className="text-white text-lg font-bold">Fruity</h3>
                    <div className="overflow-y-auto max-h-[180px] scrollbar-hide mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {['파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'].map((note) => (
                          <button
                            key={note}
                            onClick={() => toggleNote(note)}
                            className={`text-xs border border-white px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                              selectedNotes.includes(note)
                                ? 'bg-white text-black'
                                : 'bg-transparent text-white opacity-90 hover:opacity-100'
                            } hover:scale-105 active:scale-95`}
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nutty Section */}
                <div className="relative">
                  <Image
                    src="/images/Nutty.jpg"
                    alt="Nutty"
                    width={400}
                    height={240}
                    className="w-full h-60 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-between p-4 rounded-lg">
                    <h3 className="text-white text-lg font-bold">Nutty</h3>
                    <div className="overflow-y-auto max-h-[180px] scrollbar-hide mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스'].map((note) => (
                          <button
                            key={note}
                            onClick={() => toggleNote(note)}
                            className={`text-xs border border-white px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                              selectedNotes.includes(note)
                                ? 'bg-white text-black'
                                : 'bg-transparent text-white opacity-90 hover:opacity-100'
                            } hover:scale-105 active:scale-95`}
                          >
                            {note}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 추가 옵션 필터 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">추가 옵션</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 원산지 */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">원산지</h4>
                  <div className="flex flex-wrap gap-2">
                    {['에티오피아', '콜롬비아', '과테말라', '코스타리카', '파나마', '인도네시아', '브라질', '케냐', '엘살바도르', '르완다'].map((origin) => (
                      <button
                        key={origin}
                        onClick={() => toggleItem(origin, setSelectedOrigins)}
                        className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${
                          selectedOrigins.includes(origin) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {origin}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 프로세스 */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">프로세스</h4>
                  <div className="flex flex-wrap gap-2">
                    {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                      <button
                        key={process}
                        onClick={() => toggleItem(process, setSelectedProcesses)}
                        className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${
                          selectedProcesses.includes(process) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {process}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 추출방식 */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">추출방식</h4>
                  <div className="flex flex-wrap gap-2">
                    {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                      <button
                        key={method}
                        onClick={() => toggleItem(method, setSelectedBrewMethods)}
                        className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${
                          selectedBrewMethods.includes(method) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 로스팅 포인트 */}
                <div>
                  <h4 className="font-medium mb-2 text-sm">로스팅 포인트</h4>
                  <div className="flex flex-wrap gap-2">
                    {['다크', '미디엄다크', '미디엄', '미디엄라이트', '라이트'].map((roast) => (
                      <button
                        key={roast}
                        onClick={() => toggleItem(roast, setSelectedRoast)}
                        className={`text-xs px-2 py-0.5 rounded-full cursor-pointer ${
                          selectedRoast.includes(roast) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {roast}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* 오른쪽 지도 - 모바일에서는 조건부 표시 및 전체 화면 */}
        <div className={`
          ${showMapOnMobile ? 'block' : 'hidden sm:block'}
          w-full h-[calc(100vh-220px)] sm:h-auto
          lg:fixed lg:right-0 lg:top-[132px] lg:bottom-[3rem] lg:w-1/2 
          overflow-hidden shadow-lg rounded-lg sm:m-4
          ${isLoggedIn ? 'mb-[120px]' : 'mb-[96px]'} sm:mb-0
        `}>
          <div className="w-full h-full">
            <Map cafes={cafes} searchKeyword={searchKeyword} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 text-center w-full fixed bottom-0 left-0 right-0 z-10 hidden sm:block">
        <p className="text-sm text-gray-600">
          © 2024 Cup Notes Korea. All rights reserved. 
          <span className="block sm:inline mt-1 sm:mt-0 sm:ml-2">
            문의: <a href="mailto:cupnotes@outlook.com" className="text-blue-600 hover:underline">cupnotes@outlook.com</a>
          </span>
        </p>
      </footer>

      {/* 모바일 하단 네비게이션 */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around items-center">
          <button 
            className={`flex flex-col items-center p-2 flex-1 ${!showMapOnMobile ? 'text-blue-500' : 'text-gray-600'}`}
            onClick={() => setShowMapOnMobile(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">검색</span>
          </button>
          <button 
            className={`flex flex-col items-center p-2 flex-1 ${showMapOnMobile ? 'text-blue-500' : 'text-gray-600'}`}
            onClick={() => setShowMapOnMobile(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs mt-1">지도</span>
          </button>
          <button 
            className="flex flex-col items-center p-2 flex-1"
            onClick={() => {
              if (isLoggedIn) {
                router.push('/manager/dashboard');
              } else {
                router.push('/auth/login');
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">{isLoggedIn ? '내카페' : '로그인'}</span>
          </button>
          {isLoggedIn && (
            <button 
              className="flex flex-col items-center p-2 flex-1"
              onClick={handleLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">로그아웃</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}