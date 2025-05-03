'use client';
import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Flower2, Apple, Candy, Coffee } from 'lucide-react';
import MobileNavBar from '../../components/MobileNavBar';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

function QuickButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="flex flex-col items-center px-2 py-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition text-gray-800 font-semibold text-xs focus:outline-none min-w-[56px]"
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="mt-0.5" style={{letterSpacing: '0.01em'}}>{label}</span>
    </button>
  );
}

export default function MapMobilePage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [cafes, setCafes] = useState<any[]>([]);

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
    <div className="relative w-full h-[calc(100vh-4rem)]">
      {/* Quick Box */}
      <div
        className="absolute z-[120] bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl flex gap-1 px-2 py-1 items-center"
        style={{ left: '16px', top: '8px', minWidth: 240, maxWidth: 320 }}
      >
        <QuickButton icon={<Flower2 className="w-6 h-6 text-black" strokeWidth={2.2} />} label="Floral" onClick={() => handleCategorySearch('floral')} />
        <QuickButton icon={<Apple className="w-6 h-6 text-black" strokeWidth={2.2} />} label="Fruity" onClick={() => handleCategorySearch('fruity')} />
        <QuickButton icon={<Candy className="w-6 h-6 text-black" strokeWidth={2.2} />} label="Nutty" onClick={() => handleCategorySearch('nutty')} />
        <QuickButton icon={<Coffee className="w-6 h-6 text-black" strokeWidth={2.2} />} label="핸드드립" onClick={() => handleCategorySearch('핸드드립')} />
      </div>

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
        <Map ref={mapRef} cafes={cafes} onCafeSelect={() => {}} />
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[160]">
        <MobileNavBar current="map" />
      </div>
    </div>
  );
} 