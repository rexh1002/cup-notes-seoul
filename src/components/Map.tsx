'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Cafe } from '../types/types';
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
  cafes: CafeData[];
  onCafeSelect?: (cafe: CafeData) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  style?: React.CSSProperties;
  searchKeyword?: string;
  onSearch?: (category: string) => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function Map({
  cafes,
  onCafeSelect,
  initialCenter = { lat: 37.5665, lng: 126.9780 },
  initialZoom = 13,
  style = { width: '100%', height: '100%' },
  searchKeyword,
  onSearch,
}: MapProps) {
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
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
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
          title: cafe.name
        });

        const clickListener = window.naver.maps.Event.addListener(marker, 'click', () => {
          if (!mapInstance.current) return;

          const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
          mapInstance.current.setCenter(newCenter);
          mapInstance.current.setZoom(15);
          setCenter(coord);
          setSelectedCafe(cafe);
          if (onCafeSelect) onCafeSelect(cafe);

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
  }, [cafes, getCoordinates, onCafeSelect]);

  // 마커 업데이트 트리거
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers, center, zoom]);

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
          <div className="absolute top-10 left-3 right-5 sm:right-3 z-50 bg-white rounded-lg shadow-lg w-[calc(100%-32px)] sm:w-[328px] max-h-[calc(100vh-12px)] sm:max-h-[calc(100vh-72px)] flex flex-col overflow-hidden">
            {/* 카페 이미지 섹션 */}
            {selectedCafe.imageUrl && (
              <div className="w-full h-[186px] relative">
                <Image
                  src={selectedCafe.imageUrl}
                  alt={selectedCafe.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 328px"
                  priority
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* 고정된 상단 정보 */}
            <div className="flex-none p-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight">{selectedCafe.name}</h3>
                <button
                  onClick={() => setSelectedCafe(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-0.5 text-xs text-gray-600 mt-0.5">
                <p className="leading-none">
                  <span className="inline-block mr-1 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  {selectedCafe.address}
                </p>
                {selectedCafe.phone && (
                  <p className="leading-none">
                    <span className="inline-block mr-1 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    {selectedCafe.phone}
                  </p>
                )}
                {selectedCafe.description && (
                  <p className="leading-none">
                    <span className="inline-block mr-1 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    {selectedCafe.description}
                  </p>
                )}
              </div>

              {/* 영업시간 정보 */}
              {selectedCafe.businessHours && selectedCafe.businessHours.length > 0 && (
                <div className="mt-1 pt-1 border-t border-gray-100">
                  <div className="space-y-0.5">
                    {selectedCafe.businessHours.map((hour: any, index: number) => (
                      <div key={index} className="text-xs leading-none">
                        <span className="inline-block mr-1 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <span className="text-gray-600">{hour.day}:</span>{' '}
                        <span className="text-gray-600">{hour.openTime} - {hour.closeTime}</span>
                      </div>
                    ))}
                  </div>
                  {selectedCafe.businessHourNote && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-none">
                      <span className="inline-block mr-1 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {selectedCafe.businessHourNote}
                    </p>
                  )}
                </div>
              )}

              {/* SNS 링크 */}
              {selectedCafe.snsLinks && selectedCafe.snsLinks.length > 0 && (
                <div className="mt-1 pt-1 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {selectedCafe.snsLinks.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline leading-none"
                      >
                        {link.type}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 원두 라인업 섹션 */}
            {selectedCafe.coffees && selectedCafe.coffees.length > 0 && (
              <div className="flex-1 overflow-y-auto border-t border-gray-200">
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">원두 라인업</h3>
                    <span className="text-xs text-gray-500">
                      {selectedCafe.updatedAt ? `최근수정일 : ${new Date(selectedCafe.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}` : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="grid gap-1.5">
                      {selectedCafe.coffees.map((coffee) => (
                        <div
                          key={coffee.id}
                          className="rounded-lg p-2 shadow-sm relative overflow-hidden"
                          style={{
                            backgroundColor: 'white',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)'
                          }}
                        >
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundColor: coffee.noteColors?.[0] || '#F3F4F6',
                              opacity: 0.6
                            }}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='7' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.7 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                              backgroundSize: '128px 128px',
                              mixBlendMode: 'multiply',
                              opacity: 0.7
                            }}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperTexture'%3E%3CfeTurbulence type='turbulence' baseFrequency='1.4' numOctaves='5' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0.8 0 0 0 0 0 0.8 0 0 0 0 0 0.8 0 0 0 0 0 0.8 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperTexture)'/%3E%3C/svg%3E")`,
                              backgroundSize: '256px 256px',
                              mixBlendMode: 'multiply',
                              opacity: 0.4
                            }}
                          />
                          <div className="relative">
                            {/* 원두 이름과 가격 */}
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="text-sm font-medium leading-normal">{coffee.name}</h5>
                              <span className="text-xs font-medium leading-normal">
                                {coffee.price?.toLocaleString()}원
                              </span>
                            </div>

                            {/* 원두 설명 */}
                            {coffee.description && (
                              <p className="text-xs text-gray-700 mb-1.5 leading-relaxed">
                                {coffee.description}
                              </p>
                            )}

                            {/* 원두 특성 태그들 */}
                            <div className="flex flex-wrap gap-0.5">
                              {coffee.roastLevel?.map((level, idx) => (
                                <span
                                  key={`roast-${idx}`}
                                  className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-normal"
                                >
                                  {level}
                                </span>
                              ))}
                              {coffee.origins?.map((origin, idx) => (
                                <span
                                  key={`origin-${idx}`}
                                  className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-normal"
                                >
                                  {origin}
                                </span>
                              ))}
                              {coffee.processes?.map((process, idx) => (
                                <span
                                  key={`process-${idx}`}
                                  className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-normal"
                                >
                                  {process}
                                </span>
                              ))}
                              {coffee.brewMethods?.map((method, idx) => (
                                <span
                                  key={`brew-${idx}`}
                                  className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-normal"
                                >
                                  {method}
                                </span>
                              ))}
                            </div>

                            {/* 커피 노트 */}
                            {coffee.notes && coffee.notes.length > 0 && (
                              <div className="flex flex-wrap gap-0.5 mt-1">
                                {coffee.notes.map((note, idx) => (
                                  <span
                                    key={`note-${idx}`}
                                    className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-normal"
                                  >
                                    {note}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          .marker-content {
            padding: 5px 10px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 20px;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        `}</style>
      </div>
    </>
  );
}