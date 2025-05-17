'use client';
import FilterPanel from '../../components/FilterPanel';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileNavBar from '../../components/MobileNavBar';
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
      {/* 상단 검색바 제거: 공통 헤더가 모바일에서도 항상 보임 */}
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