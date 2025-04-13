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
            '<div style="cursor:pointer;width:40px;height:40px;line-height:40px;',
            'font-size:10px;color:white;text-align:center;font-weight:bold;',
            'background:rgba(0,0,0,0.7);border-radius:50%;">',
            cafe.name.substring(0, 2),
            '</div>'
          ].join(''),
          size: new window.naver.maps.Size(40, 40),
          anchor: new window.naver.maps.Point(20, 20),
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
        <div className="absolute top-16 left-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-sm w-96">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{selectedCafe.name}</h3>
            <button 
              onClick={() => setSelectedCafe(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-1">{selectedCafe.address}</p>
          {selectedCafe.phone && (
            <p className="text-sm text-gray-600 mb-1">{selectedCafe.phone}</p>
          )}
          {selectedCafe.description && (
            <p className="text-sm text-gray-600 mb-3">{selectedCafe.description}</p>
          )}
          
          {/* 원두 정보 */}
          {selectedCafe.coffees && selectedCafe.coffees.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <h4 className="font-medium text-sm mb-2">판매중인 원두</h4>
              <div className="space-y-2">
                {selectedCafe.coffees.map((coffee) => (
                  <div key={coffee.id} className="border-l-2 border-gray-200 pl-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium">{coffee.name}</span>
                      <span className="text-sm text-gray-600">
                        {coffee.price?.toLocaleString()}원
                      </span>
                    </div>
                    {coffee.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {coffee.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {coffee.roastLevel?.map((level, idx) => (
                        <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                          {level}
                        </span>
                      ))}
                      {coffee.origins?.map((origin, idx) => (
                        <span key={idx} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                          {origin}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}