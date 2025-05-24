'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { Cafe } from '@/types/types';
import Script from 'next/script';

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
  onCafeSelect: (cafe: Cafe) => void;
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
  onCafeSelect,
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
        {selectedCafe && (
          <div className="absolute top-10 right-0 z-[200] bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 w-full max-w-sm max-h-[calc(100vh-32px)] flex flex-col overflow-hidden animate-fade-in
            sm:fixed sm:bottom-0 sm:left-0 sm:right-0 sm:top-auto sm:w-full sm:max-w-none sm:rounded-t-3xl sm:rounded-b-none sm:p-4 sm:z-[999] sm:bg-white sm:border-t sm:border-gray-200 sm:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
            md:absolute md:top-10 md:right-0 md:bottom-auto md:left-auto md:w-[380px] md:max-w-sm md:rounded-2xl md:shadow-2xl md:border md:border-white/30 md:bg-white/40">
            {/* 카페 이미지 섹션 */}
            {selectedCafe.imageUrl && (
              <div className="w-full h-40 relative rounded-t-2xl overflow-hidden group sm:h-28 sm:rounded-t-lg">
                <Image
                  src={selectedCafe.imageUrl}
                  alt={selectedCafe.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  priority
                  className="object-cover w-full h-40 transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}

            {/* 고정된 상단 정보 */}
            <div className="flex-none px-4 py-4 pb-2 sm:px-2 sm:py-2 sm:pb-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-extrabold text-lg leading-tight text-gray-900 tracking-tight drop-shadow sm:text-base">{selectedCafe.name}</h3>
                <button
                  onClick={() => setSelectedCafe(null)}
                  className="text-gray-400 hover:text-gray-700 transition text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 text-sm text-gray-700 mt-1 sm:text-xs sm:space-y-0.5 sm:mt-0.5">
                <div className="flex items-center gap-3">
                  <span className="inline-block text-indigo-400 text-base sm:text-sm">📍</span>
                  <span>{selectedCafe.address}</span>
                </div>
                {selectedCafe.phone && (
                  <div className="flex items-center gap-3">
                    <span className="inline-block text-indigo-400 text-base sm:text-sm">📞</span>
                    <span>{selectedCafe.phone}</span>
                  </div>
                )}
                {selectedCafe.description && (
                  <div className="flex items-center gap-3">
                    <span className="inline-block text-indigo-400 text-base sm:text-sm">💬</span>
                    <span>{selectedCafe.description}</span>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 my-2 sm:my-1" />

              {/* 영업시간 정보 */}
              {selectedCafe.businessHours && selectedCafe.businessHours.length > 0 && (
                <div className="mt-1 pt-1">
                  <div className="space-y-0.5 text-xs text-gray-500 leading-tight sm:text-[11px]">
                    {selectedCafe.businessHours.map((hour: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="inline-block text-indigo-400 text-base sm:text-sm">⏰</span>
                        <span>{hour.day}:</span>
                        <span>{hour.openTime} - {hour.closeTime}</span>
                      </div>
                    ))}
                  </div>
                  {selectedCafe.businessHourNote && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-none flex items-center gap-2 sm:text-[11px]">
                      <span className="inline-block text-indigo-400 text-base sm:text-sm">📝</span>
                      {selectedCafe.businessHourNote}
                    </p>
                  )}
                </div>
              )}

              <div className="border-b border-gray-200 my-2 sm:my-1" />

              {/* SNS 링크 */}
              {selectedCafe.snsLinks && selectedCafe.snsLinks.length > 0 && (
                <div className="mt-1 pt-1 flex flex-wrap gap-1 sm:gap-0.5">
                  {selectedCafe.snsLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-700 underline leading-none"
                    >
                      {link.type}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* 원두 라인업 섹션 */}
            {selectedCafe.coffees && selectedCafe.coffees.length > 0 && (
              <div className="flex-1 overflow-y-auto px-4 pb-24 sm:px-1 sm:pb-16">
                <div className="flex items-center justify-between mb-2 mt-2 sm:mb-1 sm:mt-1">
                  <h3 className="font-extrabold text-base text-gray-900 tracking-tight sm:text-sm">원두 라인업</h3>
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
            )}

            <CafeTabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          </div>
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
        원두라인업
      </button>
      <button
        className={`flex-1 py-3 text-center font-bold ${selectedTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400'}`}
        onClick={() => setSelectedTab('info')}
      >
        카페정보
      </button>
    </div>
  );
}

export default Map;