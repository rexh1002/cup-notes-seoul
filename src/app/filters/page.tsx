'use client';
import FilterPanel from '../../components/FilterPanel';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';
import MobileHeader from '../../components/MobileHeader';
import React from 'react';

export default function FiltersPage() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedRoast, setSelectedRoast] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const router = useRouter();

  // 모바일 환경 체크
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // 모바일이 아니면 리다이렉트
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      router.replace('/');
    }
  }, [isMobile, router]);

  // 로그인 상태 확인 (최소 구현)
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  React.useEffect(() => {
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

  if (!isMobile) return null;

  return (
    <div className="pt-14 pb-16">
      {/* Mobile Header */}
      <MobileHeader isLoggedIn={isLoggedIn} userRole={userRole} onLogout={handleLogout} />
      {/* 모바일 전용 검색바 */}
      <div className="sticky top-0 z-30 px-3 pt-2 pb-3 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center gap-2 rounded-b-2xl shadow-md">
        <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" className="mr-2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="키워드로 검색하세요"
          className="flex-1 bg-transparent outline-none text-white placeholder:text-indigo-100 px-1 py-1 text-sm"
        />
      </div>
      <FilterPanel
        selectedNotes={selectedNotes}
        toggleNote={note => setSelectedNotes(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note])}
        selectedBrewMethods={selectedBrewMethods}
        toggleBrewMethod={method => setSelectedBrewMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method])}
        selectedOrigins={selectedOrigins}
        toggleOrigin={origin => setSelectedOrigins(prev => prev.includes(origin) ? prev.filter(o => o !== origin) : [...prev, origin])}
        selectedProcesses={selectedProcesses}
        toggleProcess={process => setSelectedProcesses(prev => prev.includes(process) ? prev.filter(p => p !== process) : [...prev, process])}
        selectedRoast={selectedRoast}
        toggleRoast={roast => setSelectedRoast(prev => prev.includes(roast) ? prev.filter(r => r !== roast) : [...prev, roast])}
        onReset={() => {
          setSelectedNotes([]);
          setSelectedBrewMethods([]);
          setSelectedOrigins([]);
          setSelectedProcesses([]);
          setSelectedRoast([]);
        }}
        onApply={() => {}}
        mobileCombined={true}
      />
      <MobileNavBar />
    </div>
  );
} 