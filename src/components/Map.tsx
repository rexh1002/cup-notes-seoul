'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

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
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function Map({
  cafes,
  onCafeSelect,
  initialCenter = { lat: 37.5665, lng: 126.9780 }, // 서울 시청
  initialZoom = 13,
  style = { width: '100%', height: '100%' },
  searchKeyword,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<CafeData | null>(null);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const [cafeCoordinates, setCafeCoordinates] = useState<Record<string, Coordinates>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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

  // 검색된 카페들의 중심점 계산 및 지도 이동
  const updateMapCenter = useCallback((coordinates: Record<string, Coordinates>) => {
    if (!mapInstance.current || Object.keys(coordinates).length === 0) return;

    const coords = Object.values(coordinates);
    const centerLat = coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length;
    const centerLng = coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length;
    
    const newCenter = new window.naver.maps.LatLng(centerLat, centerLng);
    mapInstance.current.setCenter(newCenter);
    setCenter({ lat: centerLat, lng: centerLng });

    // 모든 마커가 보이도록 zoom level 조정
    if (coords.length > 1) {
      const bounds = new window.naver.maps.LatLngBounds();
      coords.forEach(coord => {
        bounds.extend(new window.naver.maps.LatLng(coord.lat, coord.lng));
      });
      mapInstance.current.fitBounds(bounds);
    }
  }, []);

  // 마커 생성 및 관리
  const updateMarkers = useCallback(async () => {
    if (!mapInstance.current) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 카페 좌표 가져오기
    const coordinates: Record<string, Coordinates> = {};
    for (const cafe of cafes) {
      const coord = await getCoordinates(cafe.address);
      if (coord) {
        coordinates[cafe.id] = coord;
      }
    }
    setCafeCoordinates(coordinates);

    // 초기 로드가 아닐 경우에만 중심점 업데이트
    if (!isInitialLoad) {
      updateMapCenter(coordinates);
    }
    setIsInitialLoad(false);

    // 새로운 마커 생성
    cafes.forEach(cafe => {
      const coord = coordinates[cafe.id];
      if (!coord) return;

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(coord.lat, coord.lng),
        map: mapInstance.current,
        title: cafe.name,
        icon: {
          content: [
            '<div style="cursor:pointer;width:24px;height:24px;line-height:24px;',
            'background:#000000;border-radius:50%;position:relative;">',
            '<div style="position:absolute;width:12px;height:10px;',
            'background:#FFFFFF;mask:url(\'data:image/svg+xml,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 12 10\\\'><path d=\\\'M2 1h8v6a2 2 0 01-2 2H4a2 2 0 01-2-2V1z\\\' fill=\\\'white\\\'/><path d=\\\'M9 3a2 2 0 100 4\\\' fill=\\\'white\\\'/></svg>\');',
            '-webkit-mask:url(\'data:image/svg+xml,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 12 10\\\'><path d=\\\'M2 1h8v6a2 2 0 01-2 2H4a2 2 0 01-2-2V1z\\\' fill=\\\'white\\\'/><path d=\\\'M9 3a2 2 0 100 4\\\' fill=\\\'white\\\'/></svg>\');',
            'transform:translate(-50%,-50%);left:50%;top:50%;">',
            '</div>',
            '</div>'
          ].join(''),
          size: new window.naver.maps.Size(24, 24),
          anchor: new window.naver.maps.Point(12, 12),
        },
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
        mapInstance.current.setCenter(newCenter);
        mapInstance.current.setZoom(15); // 클릭 시 더 가깝게 확대
        setCenter(coord);
        setSelectedCafe(cafe);
        if (onCafeSelect) onCafeSelect(cafe);
        
        // 선택된 마커 강조
        markersRef.current.forEach(m => {
          m.setZIndex(m === marker ? 1000 : 1);
        });
      });

      markersRef.current.push(marker);
    });
  }, [cafes, getCoordinates, onCafeSelect, updateMapCenter, isInitialLoad]);

  // 컴포넌트가 마운트될 때 실행
  useEffect(() => {
    const adjustMapHeight = () => {
      if (mapRef.current) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        mapRef.current.style.height = `calc(var(--vh, 1vh) * 100 - 56px)`;
      }
    };

    adjustMapHeight();
    window.addEventListener('resize', adjustMapHeight);

    return () => {
      window.removeEventListener('resize', adjustMapHeight);
    };
  }, []);

  // 지도 초기화 및 마커 업데이트
  useEffect(() => {
    if (typeof window === 'undefined' || !window.naver) return;

    mapInstance.current = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: zoom,
      minZoom: 10,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    });

    updateMarkers();

    // 지도 이벤트 리스너
    if (mapInstance.current) {
      window.naver.maps.Event.addListener(mapInstance.current, 'dragend', () => {
        const center = mapInstance.current.getCenter();
        setCenter({ lat: center.y, lng: center.x });
      });

      window.naver.maps.Event.addListener(mapInstance.current, 'zoom_changed', () => {
        setZoom(mapInstance.current.getZoom());
      });
    }

    return () => {
      if (mapInstance.current) {
        window.naver.maps.Event.clearInstanceListeners(mapInstance.current);
      }
    };
  }, [center.lat, center.lng, zoom, updateMarkers]);

  // 선택된 카페가 변경될 때 지도 중심 이동
  useEffect(() => {
    if (selectedCafe && mapInstance.current) {
      const coord = cafeCoordinates[selectedCafe.id];
      if (coord) {
        const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
        mapInstance.current.setCenter(newCenter);
      }
    }
  }, [selectedCafe, cafeCoordinates]);

  return (
    <div 
      ref={mapRef} 
      style={{ ...style, height: 'calc(var(--vh, 1vh) * 100 - 56px)' }}
      className="relative sm:h-full"
    >
      {selectedCafe && (
        <div className="absolute top-10 left-3 right-5 sm:right-3 z-50 bg-white rounded-lg shadow-lg w-[calc(100%-32px)] sm:w-[328px] max-h-[calc(100vh-196px)] sm:max-h-[calc(100vh-256px)] flex flex-col overflow-hidden">
          {/* 카페 이미지 섹션 */}
          {selectedCafe.imageUrl && (
            <div className="w-full h-[160px] relative">
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
                  <span className="text-sm text-gray-500">
                    {selectedCafe.updatedAt ? new Date(selectedCafe.updatedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) + ' 수정' : ''}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="grid gap-1.5">
                    {selectedCafe.coffees.map((coffee) => (
                      <div
                        key={coffee.id}
                        className="rounded-lg p-2 shadow-sm relative overflow-hidden"
                        style={{
                          backgroundColor: 'transparent',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 -1px 2px rgba(255,255,255,0.15)',
                          backgroundImage: `
                            url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper-texture'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='5' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix type='matrix' in='noise' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.15 0' result='colorNoise'/%3E%3CfeBlend mode='multiply' in='SourceGraphic' in2='colorNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper-texture)' fill='white'/%3E%3C/svg%3E"),
                            url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper-grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.7' numOctaves='3' seed='2' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix type='matrix' in='noise' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.25 0' result='grainNoise'/%3E%3CfeBlend mode='multiply' in='SourceGraphic' in2='grainNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper-grain)' fill='white'/%3E%3C/svg%3E"),
                            linear-gradient(to bottom, ${coffee.noteColors?.[0] + 'CC' || '#F3F4F6CC'}, ${coffee.noteColors?.[0] + 'CC' || '#F3F4F6CC'})
                          `,
                          backgroundSize: '100px 100px, 100px 100px, 100% 100%',
                          backgroundBlendMode: 'multiply, multiply, normal'
                        }}
                      >
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}