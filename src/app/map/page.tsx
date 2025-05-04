'use client';
import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flower2, Apple, Candy, Coffee } from 'lucide-react';
import MobileNavBar from '../../components/MobileNavBar';
import MobileHeader from '../../components/MobileHeader';
import { AnimatePresence, motion } from 'framer-motion';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

function QuickButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="flex flex-col items-center px-4 py-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-bold text-base focus:outline-none min-w-[72px] gap-1"
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="mt-1" style={{letterSpacing: '0.01em'}}>{label}</span>
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

  // 카테고리 퀵서치 핸들러 (실제 검색 로직은 생략/추가 필요)
  const handleCategorySearch = (category: string) => {
    // TODO: 실제 검색 로직 연결
    alert(category + ' 검색!');
  };

  return (
    <div className="relative w-full h-full">
      {/* Mobile Header */}
      <MobileHeader isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />

      {/* Map */}
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
            style={{ maxHeight: '80vh' }}
          >
            <div className="relative h-full overflow-y-auto pb-16 md:pb-0">
              {/* 카페 정보 카드 내용 */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 