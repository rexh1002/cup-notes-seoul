'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Cafe } from '@prisma/client';

declare global {
  interface Window {
    naver: any;
  }
}

interface MapProps {
  cafes: Cafe[];
  onCafeSelect?: (cafe: Cafe) => void;
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
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
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
    <div ref={mapRef} style={style}>
      {selectedCafe && (
        <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold">{selectedCafe.name}</h3>
          <p className="text-sm text-gray-600">{selectedCafe.address}</p>
          <p className="text-sm text-gray-600">{selectedCafe.phone}</p>
        </div>
      )}
    </div>
  );
}