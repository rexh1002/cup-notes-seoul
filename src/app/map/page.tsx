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
    <div className="relative w-full h-[calc(100vh-4rem)] pb-16">
      {/* Quick Box */}
      <div
        className="absolute z-[120] bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl flex gap-1 px-2 py-1 items-center"
        style={{ left: 'calc(384px - 16px)', top: '8px', minWidth: 240, maxWidth: 320 }}
      >
        <QuickButton icon={<Flower2 className="w-6 h-6 text-black" strokeWidth={2.2} />} label="Floral" onClick={() => handleCategorySearch('floral')} />
        <QuickButton icon={<Apple className="w-6 h-6 text-black" strokeWidth={2.2} />} label="Fruity" onClick={() => handleCategorySearch('fruity')} />
        <QuickButton icon={<Candy className="w-6 h-6 text-black" strokeWidth={2.2} />} label="Nutty" onClick={() => handleCategorySearch('nutty')} />
        <QuickButton icon={<Coffee className="w-6 h-6 text-black" strokeWidth={2.2} />} label="핸드드립" onClick={() => handleCategorySearch('핸드드립')} />
      </div>
      {/* Map */}
      <Map ref={mapRef} cafes={cafes} onCafeSelect={() => {}} />
      <MobileNavBar current="map" />
    </div>
  );
} 