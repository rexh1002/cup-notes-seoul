'use client';
import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';
import MobileHeader from '../../components/MobileHeader';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

const CATEGORY_LIST = [
  { key: 'floral', label: 'Floral', image: '/images/Floralicon.png' },
  { key: 'fruity', label: 'Fruity', image: '/images/Fruityicon.png' },
  { key: 'nutty', label: 'Nutty', image: '/images/Nuttyicon.png' },
  { key: 'handdrip', label: '핸드드립', image: '/images/handdripicon.png' },
];

function QuickCard({ image, label, onClick }: { image: string; label: string; onClick: () => void }) {
  return (
    <button
      className="flex flex-col items-center justify-center w-20 h-24 md:w-24 md:h-28 bg-white rounded-xl shadow-md p-3 group focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all border border-gray-100"
      onClick={onClick}
      type="button"
      aria-label={label}
    >
      <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white rounded-full mb-2 overflow-hidden">
        <Image src={image} alt={label} width={48} height={48} className="object-contain" />
      </div>
      <span className="mt-1 text-gray-900 font-bold text-xs md:text-sm text-center whitespace-nowrap">
        {label}
      </span>
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
  const [showList, setShowList] = useState(false);

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
        } catch (error) {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }
  }, [isMounted]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setUserRole(null);
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

  return (
    <div className="relative w-full min-h-screen pt-14 pb-16">
      {/* Filters와 동일한 헤더/검색바 */}
      <MobileHeader isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />
      <div className="sticky top-0 z-30 px-3 pt-2 pb-3 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center gap-2 rounded-b-2xl shadow-md">
        <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" className="mr-2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="키워드로 검색하세요"
          className="flex-1 bg-transparent outline-none text-white placeholder:text-indigo-100 px-1 py-1 text-sm"
        />
        {searchKeyword && (
          <button onClick={() => setSearchKeyword('')} className="ml-1 text-indigo-100 hover:text-white text-lg px-1 focus:outline-none">&times;</button>
        )}
      </div>
      {/* 퀵서치 버튼 좌측 하단 세로 배열 */}
      <div className="fixed left-4 bottom-32 z-[120] flex flex-col gap-3 items-start">
        <QuickCard image="/images/Floralicon.png" label="Floral" onClick={() => handleCategorySearch('floral')} />
        <QuickCard image="/images/Fruityicon.png" label="Fruity" onClick={() => handleCategorySearch('fruity')} />
        <QuickCard image="/images/Nuttyicon.png" label="Nutty" onClick={() => handleCategorySearch('nutty')} />
        <QuickCard image="/images/handdripicon.png" label="핸드드립" onClick={() => handleCategorySearch('handdrip')} />
      </div>
      {/* 지도 영역 */}
      <div className="absolute inset-0" style={{ zIndex: 100 }}>
        {/* 현재위치 버튼 */}
        <button
          className="fixed right-6 bottom-24 z-[130] w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-blue-100 transition-colors border border-gray-200"
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="white" />
            <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>

        {/* 지도 컴포넌트 */}
        <Map ref={mapRef} cafes={cafes} onCafeSelect={(cafe) => setSelectedCafe(cafe)} />
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[160]">
        <MobileNavBar />
      </div>

      {/* 카페 정보 카드 */}
      <AnimatePresence>
        {selectedCafe && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-[150] md:relative md:rounded-xl md:shadow-none md:z-0 md:bottom-auto md:left-auto md:right-auto md:w-96 md:h-full md:overflow-y-auto md:border-r md:border-gray-200"
            style={{ maxHeight: 'calc(80vh - 4rem)' }}
          >
            <div className="relative h-full overflow-y-auto pb-16 md:pb-0">
              {/* 카페 정보 카드 내용 */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 중앙 목록보기 버튼 (네비게이션 바에 가리지 않게 더 위로) */}
      <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-[170]">
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-lg font-bold shadow-lg hover:bg-gray-900 transition"
          onClick={() => setShowList(true)}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          목록 보기
        </button>
      </div>

      {/* 목록 패널(모달) */}
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[200] max-h-[70vh] overflow-y-auto p-6"
          >
            <button className="absolute top-4 right-6 text-2xl" onClick={() => setShowList(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">매장 목록</h2>
            <ul>
              {cafes.map((cafe, idx) => (
                <li key={cafe.id || idx} className="py-3 border-b border-gray-100 flex items-center gap-3">
                  <span className="font-bold text-lg text-gray-800">{cafe.name}</span>
                  {/* 필요시 추가 정보 표시 */}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 