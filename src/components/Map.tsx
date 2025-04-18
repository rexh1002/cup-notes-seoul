'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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

  // 지도 초기화
  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: zoom,
      minZoom: 10,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    };

    mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
  }, [center.lat, center.lng, zoom]);

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
            '<div style="cursor:pointer;width:20px;height:20px;line-height:20px;',
            'font-size:10px;color:white;text-align:center;font-weight:bold;',
            'background:rgba(0,0,0,0.7);border-radius:50%;">',
            'C',
            '</div>'
          ].join(''),
          size: new window.naver.maps.Size(20, 20),
          anchor: new window.naver.maps.Point(10, 10),
        },
      });

      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
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
  }, [cafes, getCoordinates, onCafeSelect]);

  // 지도 초기화 및 마커 업데이트
  useEffect(() => {
    if (typeof window === 'undefined' || !window.naver) return;

    initMap();
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
  }, [initMap, updateMarkers]);

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
    <div ref={mapRef} style={style} className="relative">
      {selectedCafe && (
        <div className="absolute top-0 left-0 z-50 bg-white rounded-lg shadow-lg max-w-[calc(100%-2rem)] w-72 sm:w-[328px] max-h-[calc(80vh-80px)] sm:max-h-[calc(80vh-60px)] flex flex-col overflow-hidden">
          {/* 카페 이미지 섹션 */}
          {selectedCafe.imageUrl && (
            <div className="w-full h-[100px]">
              <img
                src={selectedCafe.imageUrl}
                alt={selectedCafe.name}
                className="w-full h-full object-cover"
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
                <span className="inline-block mr-1">📍</span>
                {selectedCafe.address}
              </p>
              {selectedCafe.phone && (
                <p className="leading-none">
                  <span className="inline-block mr-1">📞</span>
                  {selectedCafe.phone}
                </p>
              )}
              {selectedCafe.description && (
                <p className="leading-none">
                  <span className="inline-block mr-1">📝</span>
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
                      <span className="inline-block mr-1">🕒</span>
                      <span className="text-gray-600">{hour.day}:</span>{' '}
                      <span className="text-gray-600">{hour.openTime} - {hour.closeTime}</span>
                    </div>
                  ))}
                </div>
                {selectedCafe.businessHourNote && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-none">
                    <span className="inline-block mr-1">ℹ️</span>
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
              <div className="p-1.5 space-y-1.5">
                <h4 className="text-base font-medium sticky top-0 bg-white py-1 leading-none">원두 라인업</h4>
                <div className="grid gap-1.5">
                  {selectedCafe.coffees.map((coffee) => (
                    <div
                      key={coffee.id}
                      className="rounded-lg p-2 shadow-sm"
                      style={{
                        backgroundColor: coffee.noteColors?.[0] || '#F3F4F6'
                      }}
                    >
                      {/* 원두 이름과 가격 */}
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-sm font-medium leading-none">{coffee.name}</h5>
                        <span className="text-xs font-medium leading-none">
                          {coffee.price?.toLocaleString()}원
                        </span>
                      </div>

                      {/* 원두 설명 */}
                      {coffee.description && (
                        <p className="text-xs text-gray-700 mb-1.5 leading-tight">
                          {coffee.description}
                        </p>
                      )}

                      {/* 원두 특성 태그들 */}
                      <div className="flex flex-wrap gap-0.5">
                        {coffee.roastLevel?.map((level, idx) => (
                          <span
                            key={`roast-${idx}`}
                            className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-none"
                          >
                            {level}
                          </span>
                        ))}
                        {coffee.origins?.map((origin, idx) => (
                          <span
                            key={`origin-${idx}`}
                            className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-none"
                          >
                            {origin}
                          </span>
                        ))}
                        {coffee.processes?.map((process, idx) => (
                          <span
                            key={`process-${idx}`}
                            className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-none"
                          >
                            {process}
                          </span>
                        ))}
                        {coffee.brewMethods?.map((method, idx) => (
                          <span
                            key={`brew-${idx}`}
                            className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-none"
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
                              className="text-[10px] px-1.5 py-0.5 bg-white/80 rounded-full text-gray-700 leading-none"
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
          )}
        </div>
      )}
    </div>
  );
}