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
  { key: 'korean', label: '한식', icon: '/images/korean.png' },
  { key: 'meat', label: '육류', icon: '/images/meat.png' },
  { key: 'japanese', label: '일식', icon: '/images/japanese.png' },
  { key: 'izakaya', label: '이자카야', icon: '/images/izakaya.png' },
];

function QuickButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-bold text-base focus:outline-none min-w-[72px] bg-white shadow"
      onClick={onClick}
      type="button"
    >
      <Image src={icon} alt={label} width={24} height={24} />
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
    <div className="relative w-full h-full">
      {/* 상단 검색창 */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] w-[90vw] max-w-xl flex items-center bg-white rounded-2xl shadow-lg px-4 py-2 border border-gray-200">
        <input
          type="text"
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="매장, 지역으로 검색해 보세요."
          className="flex-1 bg-transparent outline-none text-base px-2"
        />
        <button onClick={handleSearch} className="ml-2 text-gray-500 hover:text-blue-600">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </div>
      {/* 퀵서치 버튼 */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[120] flex justify-center gap-2 px-4 bg-white rounded-2xl shadow-lg border border-gray-100 py-2">
        {CATEGORY_LIST.map(cat => (
          <QuickButton key={cat.key} icon={cat.icon} label={cat.label} onClick={() => handleCategorySearch(cat.key)} />
        ))}
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

      {/* 하단 중앙 목록보기 버튼 */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[170]">
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