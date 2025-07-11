"use client";
import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { Search, Coffee, LogIn, UserPlus, LogOut, Loader2 } from 'lucide-react';

const CATEGORY_LIST = [
  { key: 'anaerobic', label: '무산소 발효', image: '/images/Air.png' },
  { key: 'geisha', label: '게이샤', image: '/images/Geisha.png' },
  { key: 'floral', label: '꽃향 가득', image: '/images/Floralicon.png' },
  { key: 'peach', label: '복숭아', image: '/images/Peach.png' },
  { key: 'strawberry', label: '딸기', image: '/images/Strawberry.png' },
  { key: 'tropical', label: '열대과일', image: '/images/Tropical.png' },
  { key: 'berry', label: '베리류', image: '/images/Berry.png' },
  { key: 'nuttychocolate', label: '너티 초콜렛', image: '/images/Nuttychocolate.png' },
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

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function MapMobileClient() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const searchParamsString = searchParams.toString();
  const [isClient, setIsClient] = useState(false);
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
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isWebLoading, setIsWebLoading] = useState(false);
  const [isMobileLoading, setIsMobileLoading] = useState(false);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const shouldResetMapCenter = useRef(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  // 초기 위치 설정
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined' && window.innerWidth < 768) {
      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            setIsLocating(false);
          },
          (error) => {
            console.error('위치 정보를 가져오는데 실패했습니다:', error);
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [isMounted]);

  // 모바일이 아니면 리다이렉트 (useEffect에서만 처리)
  useEffect(() => {
    if (isClient && typeof window !== 'undefined' && window.innerWidth >= 768) {
      router.replace('/');
    }
  }, [isClient, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      // 쿼리 파라미터에서 필터 값 읽기
      let notes: string[] = [];
      let brewMethods: string[] = [];
      let origins: string[] = [];
      let processes: string[] = [];
      let roastLevel: string[] = [];
      // @ts-expect-error
      if (searchParams.get('notes')) notes = searchParams.get('notes').split(',').filter(Boolean);
      // @ts-expect-error
      if (searchParams.get('brewMethods')) brewMethods = searchParams.get('brewMethods').split(',').filter(Boolean);
      // @ts-expect-error
      if (searchParams.get('origins')) origins = searchParams.get('origins').split(',').filter(Boolean);
      // @ts-expect-error
      if (searchParams.get('processes')) processes = searchParams.get('processes').split(',').filter(Boolean);
      // @ts-expect-error
      if (searchParams.get('roast')) roastLevel = searchParams.get('roast').split(',').filter(Boolean);
      const hasFilter = notes.length || brewMethods.length || origins.length || processes.length || roastLevel.length;
      // 검색창에 필터 키워드 표시 (모바일에서만)
      if (typeof window !== 'undefined' && window.innerWidth < 768 && hasFilter) {
        const keywords = [
          ...notes,
          ...brewMethods,
          ...origins,
          ...processes,
          ...roastLevel
        ];
        setSearchKeyword(keywords.join(', '));
      }
      const fetchCafes = async () => {
        try {
          if (typeof window !== 'undefined' && window.innerWidth < 768 && hasFilter) setIsMobileLoading(true);
          const response = await fetch('/api/cafes/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keyword: '',
              notes,
              brewMethod: brewMethods,
              origins,
              processes,
              roastLevel,
            }),
          });
          if (!response.ok) throw new Error('카페 데이터를 불러오는데 실패했습니다.');
          const data = await response.json();
          setCafes(data.cafes || []);
        } catch (error) {
          setCafes([]);
        } finally {
          if (typeof window !== 'undefined' && window.innerWidth < 768 && hasFilter) setIsMobileLoading(false);
        }
      };
      if (hasFilter) {
        fetchCafes();
      } else {
        // 기존 전체 카페 불러오기
        const initialLoad = async () => {
          try {
            shouldResetMapCenter.current = false; // 초기 로딩 시 지도 중심 이동 방지 목적 
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
            setCafes([]);
          }
        };
        initialLoad();
      }
    }
  }, [isMounted, searchParams, searchParamsString]);

  useEffect(() => {
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

  // 검색 핸들러
  const handleSearch = async () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) setIsMobileLoading(true);
    if (typeof window !== 'undefined' && window.innerWidth >= 768) setIsWebLoading(true);
    try {
      const response = await fetch('/api/cafes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchKeyword }),
      });
      if (!response.ok) return;
      const data = await response.json();
      setCafes(data.cafes || []);
    } catch (e) {
      setCafes([]);
    } finally {
      if (typeof window !== 'undefined' && window.innerWidth < 768) setIsMobileLoading(false);
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        setIsWebLoading(false);
        setShowSearchInput(false);
      }
    }
  };

  // 카테고리 퀵서치 핸들러
  const handleCategorySearch = (category: string) => {
    if (category === 'all') {
      // 전체 버튼 클릭 시 모든 카페 불러오기
      if (typeof window !== 'undefined' && window.innerWidth < 768) setIsMobileLoading(true);
      (async () => {
        try {
          const response = await fetch('/api/cafes/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              keyword: '',
              notes: [],
              origins: [],
              processes: [],
              roastLevel: [],
              brewMethod: [],
            }),
          });
          if (!response.ok) throw new Error();
          const data = await response.json();
          setCafes(data.cafes || []);
          setSearchKeyword('');
        } catch (e) {
          setCafes([]);
        } finally {
          if (typeof window !== 'undefined' && window.innerWidth < 768) setIsMobileLoading(false);
        }
      })();
      // 쿼리 파라미터 초기화
      router.push('/map');
      return;
    }

    let searchTerms: string[] = [];
    let brewMethodTerms: string[] = [];
    let originsTerms: string[] = [];
    let processesTerms: string[] = [];
    let keywordTerm = '';

    switch (category) {
      case 'floral':
        searchTerms = ['장미', '자스민', '베르가못', '라일락'];
        keywordTerm = '꽃향 가득';
        break;
      case 'tropical':
        searchTerms = ['열대과일', '파인애플', '망고', '패션후르츠', '파파야', '리치', '메론'];
        keywordTerm = '열대과일';
        break;
      case 'nuttychocolate':
        searchTerms = ['초콜렛', '헤이즐넛', '아몬드', '마카다미아', '땅콩'];
        keywordTerm = '너티 초콜렛';
        break;
      case 'handdrip':
        brewMethodTerms = ['핸드드립'];
        keywordTerm = '핸드드립';
        break;
      case 'anaerobic':
        processesTerms = ['무산소 발효'];
        keywordTerm = '무산소 발효';
        break;
      case 'yeast':
        processesTerms = ['이스트 발효'];
        keywordTerm = '이스트 발효';
        break;
      case 'ethiopia':
        originsTerms = ['에티오피아'];
        keywordTerm = '에티오피아';
        break;
      case 'colombia':
        originsTerms = ['콜롬비아'];
        keywordTerm = '콜롬비아';
        break;
      case 'geisha':
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setSearchKeyword('게이샤');
          setIsMobileLoading(true);
          (async () => {
            try {
              const response = await fetch('/api/cafes/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: '게이샤' }),
              });
              if (!response.ok) throw new Error();
              const data = await response.json();
              setCafes(data.cafes || []);
            } catch (e) {
              setCafes([]);
            } finally {
              setIsMobileLoading(false);
            }
          })();
        }
        return;
      case 'peach':
        searchTerms = ['복숭아'];
        keywordTerm = '복숭아';
        break;
      case 'strawberry':
        searchTerms = ['딸기'];
        keywordTerm = '딸기';
        break;
      case 'berry':
        searchTerms = ['블루베리', '라즈베리', '크랜베리'];
        keywordTerm = '베리류';
        break;
      default:
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setIsMobileLoading(true);
          if (searchTerms.length > 0) {
            setSearchKeyword(searchTerms.join(', '));
          } else if (brewMethodTerms.length > 0) {
            setSearchKeyword(brewMethodTerms.join(', '));
          } else if (originsTerms.length > 0) {
            setSearchKeyword(originsTerms.join(', '));
          } else if (processesTerms.length > 0) {
            setSearchKeyword(processesTerms.join(', '));
          } else {
            setSearchKeyword(keywordTerm);
          }
          (async () => {
            try {
              const response = await fetch('/api/cafes/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  keyword: '',
                  notes: searchTerms,
                  brewMethod: brewMethodTerms,
                  origins: originsTerms,
                  processes: processesTerms,
                  roastLevel: [],
                }),
              });
              if (!response.ok) throw new Error();
              const data = await response.json();
              setCafes(data.cafes || []);
            } catch (e) {
              setCafes([]);
            } finally {
              setIsMobileLoading(false);
            }
          })();
        }
        break;
    }

    // 검색창에 실제 탐색되는 키워드 표시 (모바일에서만)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (searchTerms.length > 0) {
        setSearchKeyword(searchTerms.join(', '));
      } else if (brewMethodTerms.length > 0) {
        setSearchKeyword(brewMethodTerms.join(', '));
      } else if (originsTerms.length > 0) {
        setSearchKeyword(originsTerms.join(', '));
      } else if (processesTerms.length > 0) {
        setSearchKeyword(processesTerms.join(', '));
      } else {
        setSearchKeyword(keywordTerm);
      }
    }

    // 쿼리 파라미터 업데이트 (router.push)
    const params = new URLSearchParams();
    if (searchTerms.length) params.append('notes', searchTerms.join(','));
    if (brewMethodTerms.length) params.append('brewMethods', brewMethodTerms.join(','));
    if (originsTerms.length) params.append('origins', originsTerms.join(','));
    if (processesTerms.length) params.append('processes', processesTerms.join(','));
    // keywordTerm은 검색창에만 표시
    router.push(`/map?${params.toString()}`);
  };

  const handleCafeClick = (cafe: any) => {
    setSelectedCafe(cafe);
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

  // 현재위치로 이동 최적화 함수
  const handleMoveToCurrentLocation = () => {
    const tryMove = (retry = 0) => {
      if (!(window.currentMap && window.currentMap.setCenter)) {
        if (retry < 3) {
          setTimeout(() => tryMove(retry + 1), 500);
        } else {
          window.alert('지도를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요.');
        }
        return;
      }
      if (!navigator.geolocation) {
        window.alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
        return;
      }
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const { latitude, longitude } = position.coords;
          const mapInstance = window.currentMap;
          if (mapInstance && mapInstance.setCenter) {
            // 즉시 지도 중심 이동 및 줌 적용
            const location = new window.naver.maps.LatLng(latitude, longitude);
            mapInstance.setCenter(location);
            mapInstance.setZoom(15);
          } else {
            window.alert('지도를 찾을 수 없습니다.');
          }
        },
        (error) => {
          setIsLocating(false);
          let msg = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = '위치 권한이 거부되었습니다. 브라우저/앱 설정에서 위치 권한을 허용해 주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = '위치 정보를 사용할 수 없습니다. GPS 또는 네트워크 상태를 확인해 주세요.';
              break;
            case error.TIMEOUT:
              msg = '위치 정보를 가져오는데 시간이 초과되었습니다. 신호가 잘 잡히는 곳에서 다시 시도해 주세요.';
              break;
            default:
              msg = '현재 위치를 가져올 수 없습니다. 위치 서비스 및 권한을 확인해 주세요.';
          }
          window.alert(msg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };
    tryMove();
  };

  useEffect(() => {
    if (
      cafes &&
      cafes.length > 0 &&
      isClient &&
      typeof window !== 'undefined' &&
      window.innerWidth < 768 &&
      window.currentMap &&
      shouldResetMapCenter.current
    ) {
      const firstCafe = cafes[0];
      const address = firstCafe.address;
      window.naver.maps.Service.geocode({ address }, function (status, response) {
        if (status === window.naver.maps.Service.Status.OK) {
          const result = response.v2.addresses[0];
          const lat = parseFloat(result.y);
          const lng = parseFloat(result.x);
          const newCenter = new window.naver.maps.LatLng(lat, lng);
          window.currentMap.setCenter(newCenter);
        }
      });
    }
  }, [cafes, isClient]);

  // QuickCard 컴포넌트 위에 All 아이콘용
  const ALL_ICON = () => (
    <span style={{
      display: 'inline-block',
      width: 16,
      height: 16,
      borderRadius: 8,
      background: '#f3f4f6',
      color: '#222',
      fontWeight: 700,
      fontSize: 12,
      lineHeight: '16px',
      textAlign: 'center',
      border: '1px solid #d1d5db',
    }}>All</span>
  );

  return (
    <div className="relative w-full min-h-screen pt-14 pb-16">
      {/* 모바일: 헤더 아래 검색 입력칸 */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <div className="fixed top-[2px] left-0 right-0 z-[110] bg-white px-4 py-2 border-b border-gray-100 flex items-center gap-2" style={{boxShadow:'0 2px 8px 0 rgba(0,0,0,0.03)'}}>
          <div className="relative w-full flex-1">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-[#f7f7f7] text-base font-sans focus:outline-none focus:ring-2 focus:ring-bluebottle-blue transition placeholder:text-gray-400 pr-10"
              placeholder="카페, 키워드 검색"
              value={searchKeyword}
              onChange={e => { setSearchKeyword(e.target.value); fetchAutocomplete(e.target.value); }}
              onFocus={() => { if (autocomplete.length) setShowAutocomplete(true); }}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
              onKeyDown={e => { if (e.key === 'Enter') { handleSearch(); setShowAutocomplete(false); } }}
              style={{minWidth:0}}
            />
            {/* dot-bounce 스피너 */}
            {isMobileLoading && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 dot-bounce">
                <span></span><span></span><span></span>
              </span>
            )}
            {/* dot-bounce 스타일 */}
            <style>{`
              .dot-bounce {
                display: flex;
                align-items: center;
                gap: 3px;
              }
              .dot-bounce span {
                display: block;
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #2563eb;
                animation: dot-bounce 1s infinite ease-in-out both;
              }
              .dot-bounce span:nth-child(2) { animation-delay: 0.2s; }
              .dot-bounce span:nth-child(3) { animation-delay: 0.4s; }
              @keyframes dot-bounce {
                0%, 80%, 100% { transform: scale(0.7); }
                40% { transform: scale(1.3); }
              }
            `}</style>
          </div>
          <button
            className="ml-2 px-3 py-2 bg-bluebottle-blue text-white rounded-lg font-bold text-sm shadow-sm hover:bg-[#004b82] transition"
            onClick={async () => {
              if (searchKeyword) {
                // X 버튼 클릭 시: 검색어 및 지도 초기화
                setSearchKeyword('');
                setIsMobileLoading(true);
                const resetCafes = async () => {
                  try {
                    const res = await fetch('/api/cafes/search', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        keyword: '',
                        notes: [],
                        origins: [],
                        processes: [],
                        roastLevel: [],
                        brewMethod: [],
                        fields: ['id', 'name', 'address', 'imageUrl'],
                      }),
                    });
                    const data = await res.json();
                    setCafes(data.cafes || []);
                  } catch (e) {
                    setCafes([]);
                  } finally {
                    setIsMobileLoading(false);
                  }
                };
                await resetCafes();
              } else {
                handleSearch();
              }
            }}
            aria-label={searchKeyword ? '초기화' : '검색'}
          >
            {searchKeyword ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="5" y1="5" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="15" y1="5" x2="5" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      )}
      {/* 모바일 지도 QuickButton 그룹 중앙 상단 가로 배치 */}
      {typeof window !== 'undefined' && window.innerWidth < 768 && (
        <>
          <style>{`
            .scrollbar-transparent::-webkit-scrollbar { height: 0 !important; background: transparent; }
            .scrollbar-transparent { scrollbar-width: none; -ms-overflow-style: none; }
            .scrollbar-transparent::-webkit-scrollbar-thumb { background: transparent; }
          `}</style>
          <div className="fixed top-20 left-0 right-0 z-[110] w-full max-w-full overflow-x-auto scrollbar-transparent" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div role="quick-scroll" className="flex flex-row gap-2 items-center pl-2 pr-2">
              <button
                className="flex flex-row items-center justify-center flex-shrink-0 min-w-fit rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-medium text-sm px-3 py-1.5 gap-2 whitespace-nowrap"
                onClick={() => handleCategorySearch('all')}
                type="button"
              >
                <ALL_ICON />
                <span>전체</span>
              </button>
              {CATEGORY_LIST.map(cat => (
                <QuickCard key={cat.key} image={cat.image} label={cat.label} onClick={() => handleCategorySearch(cat.key)} />
              ))}
            </div>
          </div>
        </>
      )}
      {/* 웹화면 퀵서치 버튼 그룹 */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 8 }}>
          <div style={{ maxWidth: 600, width: '100%', display: 'flex', gap: 12, justifyContent: 'center', padding: '0 12px' }}>
            <button
              className="flex flex-row items-center justify-center flex-shrink-0 min-w-fit rounded-full bg-white shadow border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-medium text-sm px-3 py-1.5 gap-2 whitespace-nowrap"
              onClick={() => handleCategorySearch('all')}
              type="button"
            >
              <ALL_ICON />
              <span>전체</span>
            </button>
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
                <div className="relative">
                  <input
                    type="text"
                    className="ml-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                    placeholder="키워드 검색"
                    value={searchKeyword}
                    onChange={e => { setSearchKeyword(e.target.value); fetchAutocomplete(e.target.value); }}
                    onFocus={() => { if (autocomplete.length) setShowAutocomplete(true); }}
                    onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
                    onKeyDown={e => { if (e.key === 'Enter') { handleSearch(); setShowAutocomplete(false); } }}
                    autoFocus
                    style={{ width: 180 }}
                  />
                  {/* 웹 헤더 자동완성 드롭다운 */}
                  {showAutocomplete && autocomplete.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow z-[200] max-h-48 overflow-y-auto">
                      {autocomplete.map((item, idx) => (
                        <div
                          key={item + idx}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                          onMouseDown={() => { setSearchKeyword(item); setShowAutocomplete(false); setShowSearchInput(false); }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 웹화면에서만 로딩 스피너 */}
                  {typeof window !== 'undefined' && window.innerWidth >= 768 && isWebLoading && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-blue-500">
                      <Loader2 className="w-5 h-5" />
                    </span>
                  )}
                </div>
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
                      className="p-2 rounded-full border border-gray-300 bg-white text-[#222] font-bold text-xs w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
                      onClick={() => router.push('/manager/dashboard')}
                      aria-label="내 카페 관리"
                    >
                      Cafe
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
      {/* 지도 영역 */}
      <div className="absolute inset-0" style={{ zIndex: 100 }} onClick={() => {
        // 모바일 환경에서만 검색창 입력모드 해제
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.blur();
          }
        }
      }}>
        {/* 현재위치 버튼 */}
        <button
          className="fixed right-6 bottom-24 z-[200] w-14 h-14 flex items-center justify-center rounded-full border border-gray-200 shadow-lg transition-colors bg-white"
          onClick={handleMoveToCurrentLocation}
          aria-label="현재위치로 이동"
        >
          {isLocating ? (
            <span className="dot-bounce"><span></span><span></span><span></span></span>
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
              <rect x="4" y="4" width="24" height="24" rx="6" fill="white"/>
              <circle cx="16" cy="16" r="7" stroke="#222" strokeWidth="2"/>
              <circle cx="16" cy="16" r="2" fill="#222"/>
              <line x1="16" y1="9" x2="16" y2="6" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="23" x2="16" y2="26" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
              <line x1="23" y1="16" x2="26" y2="16" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="16" x2="6" y2="16" stroke="#222" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>
        <style>{`
          .dot-bounce {
            display: flex;
            align-items: center;
            gap: 3px;
          }
          .dot-bounce span {
            display: block;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #2563eb;
            animation: dot-bounce 1s infinite ease-in-out both;
          }
          .dot-bounce span:nth-child(2) { animation-delay: 0.2s; }
          .dot-bounce span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes dot-bounce {
            0%, 80%, 100% { transform: scale(0.7); }
            40% { transform: scale(1.3); }
          }
        `}</style>

        {/* 지도 컴포넌트 */}
        <Map 
          ref={mapRef} 
          cafes={cafes} 
          initialCenter={currentLocation || undefined}
          currentLocation={currentLocation}
        />
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[160]">
        <MobileNavBar />
      </div>
    </div>
  );
} 