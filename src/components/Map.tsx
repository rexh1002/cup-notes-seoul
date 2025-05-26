'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { Cafe } from '@/types/types';
import Script from 'next/script';
import { MapPin, Phone, MessageCircle, Clock, Info, Share2 } from 'lucide-react';
import { createPortal } from 'react-dom';

declare global {
  interface Window {
    naver: any;
  }
}

interface CafeData {
  id: string;
  name: string;
  address: string;
  phone?: string | null;
  description?: string | null;
  businessHours?: any;
  businessHourNote?: string | null;
  snsLinks?: any;
  imageUrl?: string | null;
  adminId?: string | null;
  managerId?: string | null;
  coffees?: {
    id: string;
    name: string;
    price?: number | null;
    description?: string | null;
    roastLevel?: string[] | null;
    origins?: string[] | null;
    processes?: string[] | null;
    brewMethods?: string[] | null;
    notes?: string[] | null;
    noteColors?: string[] | null;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
  lastUpdated?: string;
}

interface MapProps {
  cafes: Cafe[];
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  style?: React.CSSProperties;
  searchKeyword?: string;
  onSearch?: (keyword: string) => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapHandle {
  moveToCurrentLocation: (lat: number, lng: number) => void;
}

const Map = forwardRef<MapHandle, MapProps>(function Map({
  cafes,
  initialCenter = { lat: 37.5665, lng: 126.9780 },
  initialZoom = 13,
  style = { width: '100%', height: '100%' },
  searchKeyword,
  onSearch,
}, ref) {
  console.log('[Map] 컴포넌트 렌더링', { cafes: cafes.length, center: initialCenter, zoom: initialZoom });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const eventListenersRef = useRef<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<CafeData | null>(null);
  const [center, setCenter] = useState<Coordinates>(initialCenter);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [cafeCoordinates, setCafeCoordinates] = useState<Record<string, Coordinates>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'beans' | 'info'>('beans');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchMoveY, setTouchMoveY] = useState(0);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [canDrag, setCanDrag] = useState(true);
  const tabMenuRef = useRef<HTMLDivElement>(null);

  // 검색 카테고리 정의
  const searchCategories = {
    floral: ['라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'],
    fruity: ['파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'],
    nutty: ['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스']
  };

  // 주소를 좌표로 변환
  const getCoordinates = useCallback(async (address: string): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      if (!window.naver || !window.naver.maps) {
        resolve(null);
        return;
      }

      window.naver.maps.Service.geocode(
        { query: address },
        (status: number, response: any) => {
          if (status === 200 && response.v2.addresses.length > 0) {
            const item = response.v2.addresses[0];
            resolve({
              lat: parseFloat(item.y),
              lng: parseFloat(item.x),
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }, []);

  // 이벤트 리스너 등록 함수
  const registerMapEvents = useCallback(() => {
    if (!mapInstance.current || !window.naver || !window.naver.maps) return;

    // 기존 이벤트 리스너 제거
    eventListenersRef.current.forEach(listener => {
      window.naver.maps.Event.removeListener(listener);
    });
    eventListenersRef.current = [];

    const addListener = (eventName: string, handler: (...args: any[]) => void) => {
      const listener = window.naver.maps.Event.addListener(mapInstance.current, eventName, handler);
      eventListenersRef.current.push(listener);
    };

    // 지도 이동 이벤트
    addListener('dragend', () => {
      if (!mapInstance.current) return;
      const mapCenter = mapInstance.current.getCenter();
      setCenter({ lat: mapCenter.lat(), lng: mapCenter.lng() });
    });

    // 줌 변경 이벤트
    addListener('zoom_changed', () => {
      if (!mapInstance.current) return;
      setZoom(mapInstance.current.getZoom());
    });

    // 지도 클릭 이벤트 - 선택된 카페 초기화
    addListener('click', () => {
      setSelectedCafe(null);
    });

    console.log('[Map] 이벤트 리스너 등록 완료');
  }, []);

  // 지도 컨테이너 크기 조정
  useEffect(() => {
    const adjustMapSize = () => {
      if (mapRef.current) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        mapRef.current.style.height = `calc(100vh - 64px)`; // 헤더 높이 제외
        console.log('[Map] 지도 컨테이너 크기 조정됨');
      }
    };

    adjustMapSize();
    window.addEventListener('resize', adjustMapSize);

    return () => {
      window.removeEventListener('resize', adjustMapSize);
    };
  }, []);

  // 지도 인스턴스 생성
  useEffect(() => {
    const initializeMap = () => {
      if (!window.naver || !window.naver.maps || !mapRef.current) {
        console.log('[Map] 네이버 지도 객체 또는 맵 참조 없음');
        return false;
      }

      try {
        console.log('[Map] 지도 초기화 시작');

        const mapOptions = {
          center: new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
          zoom: initialZoom,
          minZoom: 10,
          maxZoom: 21,
          scaleControl: false,
          mapDataControl: false,
          zoomControl: false,
        };

        // 기존 인스턴스 제거
        if (mapInstance.current) {
          console.log('[Map] 기존 지도 인스턴스 제거');
          mapInstance.current.destroy();
          mapInstance.current = null;
        }

        // 새 인스턴스 생성
        console.log('[Map] 새 지도 인스턴스 생성 시도', {
          containerSize: {
            width: mapRef.current.clientWidth,
            height: mapRef.current.clientHeight
          },
          options: mapOptions
        });

        mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
        console.log('[Map] 새 지도 인스턴스 생성 완료');

        // 이벤트 리스너 등록
        registerMapEvents();

        return true;
      } catch (error) {
        console.error('[Map] 지도 초기화 중 오류 발생:', error);
        return false;
      }
    };

    // 초기화 시도
    const initialize = () => {
      const initialized = initializeMap();
      if (!initialized) {
        console.log('[Map] 초기화 재시도 예약');
        setTimeout(initialize, 500); // 대기 시간 증가
      }
    };

    // 스크립트 로드 확인 후 초기화
    if (window.naver && window.naver.maps) {
      initialize();
    } else {
      console.log('[Map] 네이버 지도 스크립트 로드 대기');
      const checkScript = setInterval(() => {
        if (window.naver && window.naver.maps) {
          clearInterval(checkScript);
          initialize();
        }
      }, 100);

      return () => clearInterval(checkScript);
    }

    return () => {
      console.log('[Map] 컴포넌트 정리 시작');
      // 이벤트 리스너 제거
      eventListenersRef.current.forEach(listener => {
        window.naver.maps.Event.removeListener(listener);
      });
      eventListenersRef.current = [];

      // 마커 제거
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];

      // 지도 인스턴스 제거
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      console.log('[Map] 컴포넌트 정리 완료');
    };
  }, [initialCenter.lat, initialCenter.lng, initialZoom, registerMapEvents]);

  // 마커 업데이트 함수
  const updateMarkers = useCallback(async () => {
    if (!mapInstance.current) {
      console.warn('[Map] 마커 업데이트 실패: 지도 인스턴스 없음');
      return;
    }

    console.log('[Map] 마커 업데이트 시작');

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    for (const cafe of cafes) {
      try {
        const coord = await getCoordinates(cafe.address);
        if (!coord) {
          console.warn(`[Map] 좌표 변환 실패: ${cafe.name}`);
          continue;
        }

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(coord.lat, coord.lng),
          map: mapInstance.current,
          title: cafe.name,
          icon: {
            url: '/images/cupnoteicon.png',
            size: new window.naver.maps.Size(27, 27),
            scaledSize: new window.naver.maps.Size(27, 27),
            origin: new window.naver.maps.Point(0, 0),
            anchor: new window.naver.maps.Point(13.5, 27)
          }
        });

        // 마커 호버 효과 추가
        const markerDom = marker.getElement();
        if (markerDom) {
          markerDom.addEventListener('mouseover', () => {
            markerDom.style.transform = 'scale(1.1)';
            markerDom.style.transition = 'transform 0.2s ease';
          });

          markerDom.addEventListener('mouseout', () => {
            markerDom.style.transform = 'scale(1)';
          });
        }

        const clickListener = window.naver.maps.Event.addListener(marker, 'click', () => {
          if (!mapInstance.current) return;

          const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
          mapInstance.current.setCenter(newCenter);
          mapInstance.current.setZoom(15);
          setCenter(coord);
          setSelectedCafe(cafe);

          // 선택된 마커 강조
          markersRef.current.forEach(m => {
            m.setZIndex(m === marker ? 1000 : 1);
          });
        });

        eventListenersRef.current.push(clickListener);
        markersRef.current.push(marker);
      } catch (error) {
        console.error(`[Map] 마커 생성 실패: ${cafe.name}`, error);
      }
    }

    console.log('[Map] 마커 업데이트 완료:', markersRef.current.length);
  }, [cafes, getCoordinates]);

  // 마커 업데이트 트리거
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers, center, zoom]);

  // 외부에서 현재위치로 이동할 수 있도록 메서드 노출
  useImperativeHandle(ref, () => ({
    moveToCurrentLocation: (lat: number, lng: number) => {
      if (mapInstance.current && window.naver && window.naver.maps) {
        const newCenter = new window.naver.maps.LatLng(lat, lng);
        mapInstance.current.setCenter(newCenter);
        setCenter({ lat, lng });
        setZoom(15);
      }
    }
  }));

  // 터치 이벤트 핸들러
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (window.innerWidth < 768 && canDrag) {
      e.preventDefault();
      const touchDiff = touchMoveY - touchStartY;
      setDragTranslateY(0);
      if (touchDiff < -100) setIsFullScreen(true);
      else if (touchDiff > 100) setIsFullScreen(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) {
      // 탭 영역에서 터치가 시작되면 드래그 무시
      if (tabMenuRef.current && tabMenuRef.current.contains(e.target as Node)) {
        setCanDrag(false);
        return;
      }
      setCanDrag(true);
      e.preventDefault();
      const touch = e.touches[0];
      setTouchStartY(touch.clientY);
      setTouchMoveY(touch.clientY);
      setDragTranslateY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth < 768 && canDrag) {
      e.preventDefault();
      const touch = e.touches[0];
      const currentY = touch.clientY;
      setTouchMoveY(currentY);
      setDragTranslateY(currentY - touchStartY);
    }
  };

  return (
    <>
      <Script
        src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=sn5m2djclr&submodules=geocoder"
        strategy="afterInteractive"
        onLoad={() => console.log('[Map] 네이버 지도 스크립트 로드 완료')}
      />
      <div 
        ref={mapRef} 
        className="relative w-full h-full min-h-[400px] bg-gray-100"
        style={{
          ...style,
          height: 'calc(100vh - 64px)', // 헤더 높이 제외
        }}
      >
        {/* 지도 영역 내부에는 카드 렌더링 X */}
        {/* 카페 정보 카드는 포탈로 body에 렌더링 */}
        {selectedCafe && typeof window !== 'undefined' && createPortal(
          <div 
            className={`fixed left-0 right-0
              ${isFullScreen ? 'top-0 h-screen rounded-none max-h-none' : 'top-[52%] h-[70%] rounded-2xl max-h-[calc(100vh-32px)]'}
              z-[99999] bg-white/40 backdrop-blur-xl shadow-2xl border border-white/30 w-full max-w-sm flex flex-col overflow-hidden animate-fade-in
              sm:left-0 sm:right-0 sm:w-full sm:max-w-none sm:p-4 sm:z-[99999] sm:bg-white sm:border-t sm:border-gray-200 sm:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
              md:absolute md:top-10 md:right-0 md:bottom-auto md:left-auto md:w-[380px] md:max-w-sm md:rounded-2xl md:shadow-2xl md:border md:border-white/30 md:bg-white/40 md:h-auto`}
            style={{
              touchAction: 'none',
              transition: isFullScreen ? 'none' : 'transform 0.3s ease-out',
              position: 'fixed',
              zIndex: 99999,
              transform: dragTranslateY !== 0 ? `translateY(${dragTranslateY}px)` : undefined
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* 드래그 핸들(상단 바) */}
            <div
              className="w-full h-12 flex items-center justify-center bg-gray-50 sm:flex md:hidden select-none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* 이미지 섹션 */}
            {selectedCafe.imageUrl && (
              <div className="w-full relative rounded-t-2xl overflow-hidden group sm:h-[2cm] md:h-[200px]" style={{ height: '60px', ...(typeof window !== 'undefined' && window.innerWidth < 640 ? { height: '2cm' } : {}) }}>
                <Image
                  src={selectedCafe.imageUrl}
                  alt={selectedCafe.name}
                  width={480}
                  height={200}
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}
            {/* 카페 이름 섹션 추가 */}
            {selectedCafe.imageUrl && (
              <div className="w-full py-2 text-center bg-white border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">{selectedCafe.name}</h2>
              </div>
            )}
            {/* 탭 상태 및 메뉴 (드래그 핸들/이미지 아래에 배치) */}
            <div style={{ marginTop: '0px' }} ref={tabMenuRef}>
              <CafeTabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            </div>
            {/* 탭별 내용 */}
            {selectedTab === 'beans' ? (
              selectedCafe.coffees && selectedCafe.coffees.length > 0 && (
                <div className="cafe-scroll-area flex-1 overflow-hidden px-4 pb-24 sm:px-1 sm:pb-16 leading-relaxed">
                  <div className="flex items-center justify-end mb-2 mt-2 sm:mb-1 sm:mt-1">
                    <span className="text-xs text-gray-500">
                      {selectedCafe.updatedAt ? `최근수정일 : ${new Date(selectedCafe.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}` : ''}
                    </span>
                  </div>
                  <div className="space-y-3 sm:space-y-1.5">
                    {selectedCafe.coffees.map((coffee) => (
                      <div
                        key={coffee.id}
                        className="relative rounded-xl pt-4 pb-2 px-4 shadow bg-white/70 backdrop-blur border border-white/40 flex flex-col gap-0.5 transition-transform hover:-translate-y-1 hover:shadow-xl
                          sm:rounded-lg sm:pt-2 sm:pb-1 sm:px-2 sm:gap-0.5"
                        style={{
                          backgroundColor: coffee.noteColors?.[0] || 'rgba(255,255,255,0.7)',
                          boxShadow: '0 2px 8px 0 rgba(80,80,120,0.10), inset 0 1px 2px rgba(0,0,0,0.08)'
                        }}
                      >
                        {/* 원두 이름과 가격 */}
                        <div className="flex justify-between items-center mb-0.5">
                          <h5 className="text-base font-bold leading-tight text-gray-900 sm:text-sm">{coffee.name}</h5>
                          <span className="text-sm font-semibold leading-tight text-gray-700 sm:text-xs">
                            {coffee.price?.toLocaleString()}원
                          </span>
                        </div>
                        {/* 원두 설명 */}
                        {coffee.description && (
                          <p className="text-sm text-gray-700 mb-0.5 leading-tight sm:text-xs">
                            {coffee.description}
                          </p>
                        )}
                        {/* 원두 특성 태그들 */}
                        <div className="flex flex-wrap gap-1 mb-0.5 sm:gap-0.5">
                          {coffee.roastLevel?.map((level, idx) => (
                            <span
                              key={`roast-${idx}`}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200 sm:px-1 sm:py-0.5"
                            >
                              {level}
                            </span>
                          ))}
                          {coffee.origins?.map((origin, idx) => (
                            <span
                              key={`origin-${idx}`}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200 sm:px-1 sm:py-0.5"
                            >
                              {origin}
                            </span>
                          ))}
                          {coffee.processes?.map((process, idx) => (
                            <span
                              key={`process-${idx}`}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200 sm:px-1 sm:py-0.5"
                            >
                              {process}
                            </span>
                          ))}
                          {coffee.brewMethods?.map((method, idx) => (
                            <span
                              key={`brew-${idx}`}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200 sm:px-1 sm:py-0.5"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                        {/* 커피 노트: 컬러풀한 원(circle)로 표현 */}
                        {coffee.notes && coffee.notes.length > 0 && Array.isArray(coffee.noteColors) && (
                          <div className="flex flex-wrap gap-1 mt-0.5 items-center sm:gap-0.5">
                            {coffee.notes.map((note, idx) => (
                              <span key={`note-${idx}`} className="flex items-center gap-1">
                                <span className="inline-block w-4 h-4 rounded-full border border-white shadow sm:w-3 sm:h-3" style={{ background: coffee.noteColors?.[idx] || '#eee' }} />
                                <span className="text-[11px] text-gray-800 font-medium sm:text-[10px]">{note}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="p-4 space-y-3 leading-relaxed">
                <div className="text-sm text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /><b>주소:</b> {selectedCafe.address}</div>
                {selectedCafe.phone && <div className="text-sm text-gray-700 flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /><b>전화번호:</b> {selectedCafe.phone}</div>}
                {selectedCafe.description && <div className="text-sm text-gray-700 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-500" /><b>소개:</b> {selectedCafe.description}</div>}
                {selectedCafe.businessHours && selectedCafe.businessHours.length > 0 && (
                  <div className="text-sm text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /><b>영업정보:</b>
                    <ul className="ml-6 list-disc">
                      {selectedCafe.businessHours.map((hour: any, idx: number) => (
                        <li key={idx}>{hour.day}: {hour.openTime} - {hour.closeTime}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedCafe.businessHourNote && (
                  <div className="text-sm text-gray-700 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /><b>영업메모:</b> {selectedCafe.businessHourNote}</div>
                )}
                {selectedCafe.snsLinks && selectedCafe.snsLinks.length > 0 && (
                  <div className="text-sm text-gray-700 flex items-center gap-2"><Share2 className="w-4 h-4 text-blue-500" /><b>SNS:</b> {selectedCafe.snsLinks.map((link: any, idx: number) => (
                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="ml-2 underline text-blue-600">{link.type}</a>
                  ))}</div>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
      </div>
    </>
  );
});

function CafeTabMenu({ selectedTab, setSelectedTab }: { selectedTab: 'beans' | 'info'; setSelectedTab: (tab: 'beans' | 'info') => void }) {
  return (
    <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
      <button
        className={`flex-1 py-3 text-center font-bold ${selectedTab === 'beans' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400'}`}
        onClick={() => setSelectedTab('beans')}
      >
        원두 라인업
      </button>
      <button
        className={`flex-1 py-3 text-center font-bold ${selectedTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400'}`}
        onClick={() => setSelectedTab('info')}
      >
        카페 정보
      </button>
    </div>
  );
}

export default Map;