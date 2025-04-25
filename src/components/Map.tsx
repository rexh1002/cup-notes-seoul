'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { Cafe } from '../types/types';

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
  initialCenter = { lat: 37.5665, lng: 126.9780 }, // 서울 시청
  initialZoom = 13,
  style = { width: '100%', height: '100%' },
  searchKeyword,
  onSearch,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<CafeData | null>(null);
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
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
        mapRef.current.style.height = '100%';
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
      mapTypeControl: false,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.RIGHT_BOTTOM,
        style: window.naver.maps.ZoomControlStyle.SMALL
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
    <div className="relative w-full h-full">
      {/* 실제 지도 */}
      <div ref={mapRef} className="w-full h-full" />

      {selectedCafe && (
        <div className="absolute top-10 left-3 right-5 sm:right-3 z-50 bg-white rounded-lg shadow-lg w-[calc(100%-32px)] sm:w-[328px] max-h-[calc(100vh-12px)] sm:max-h-[calc(100vh-72px)] flex flex-col overflow-hidden">
          <div className="p-4 bg-white rounded-lg shadow-lg max-w-sm">
            <h3 className="text-lg font-bold mb-2">{selectedCafe.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{selectedCafe.address}</p>
            {selectedCafe.description && <p className="text-sm text-gray-500 mb-2">{selectedCafe.description}</p>}
          </div>
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
  );
}