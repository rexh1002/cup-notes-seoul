'use client';

import { useEffect, useRef, useState } from 'react';
import { Cafe, MapProps, Coordinates } from '../types/types';

declare global {
  interface Window {
    naver: any;
    currentMap: any;
    moveToCurrentLocation: (() => void) | null;
  }
}

interface MapWithSearchProps extends MapProps {
  searchKeyword: string;
}

export default function Map({ cafes, searchKeyword }: MapWithSearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const mapInstanceRef = useRef<any>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [favoriteCafes, setFavoriteCafes] = useState<Set<string>>(new Set());

  // 카페를 즐겨찾기에 추가/제거하는 토글 함수
  const toggleFavorite = (cafeId: string) => {
    setFavoriteCafes((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(cafeId)) {
        newFavorites.delete(cafeId);
      } else {
        newFavorites.add(cafeId);
      }
      return newFavorites;
    });
  };

  const getCoordinates = async (address: string): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      if (!window.naver || !window.naver.maps) {
        console.error('Naver maps not loaded');
        resolve(null);
        return;
      }

      window.naver.maps.Service.geocode(
        {
          query: address,
        },
        function (status: number, response: any) {
          if (status === 200 && response.v2.addresses.length > 0) {
            const item = response.v2.addresses[0];
            resolve({
              lat: parseFloat(item.y),
              lng: parseFloat(item.x),
            });
          } else {
            console.error('Geocoding failed:', status, response);
            resolve(null);
          }
        }
      );
    });
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (!window.naver || !mapInstanceRef.current) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = new window.naver.maps.LatLng(latitude, longitude);
        mapInstanceRef.current.setCenter(currentPosition);
        mapInstanceRef.current.setZoom(15);
      },
      (error) => {
        console.error('위치 정보를 가져오는데 실패했습니다:', error);
        alert('현재 위치를 가져올 수 없습니다.');
      }
    );
  };

  useEffect(() => {
    if (!mapRef.current || !window.naver) return;

    const createCafeMarkers = async () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      for (const cafe of cafes) {
        const coordinates = await getCoordinates(cafe.address);
        if (coordinates) {
          const position = new window.naver.maps.LatLng(coordinates.lat, coordinates.lng);
          const isHighlighted = searchKeyword &&
            (cafe.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
             cafe.address.toLowerCase().includes(searchKeyword.toLowerCase()));
          
          // 즐겨찾기 여부 확인
          const isFavorite = favoriteCafes.has(cafe.id);
          
          // 마커 아이콘 설정 - 즐겨찾기인 경우 파란색 원 안에 하얀색 하트 아이콘으로 변경
          const iconContent = isFavorite 
            ? `
              <div style="
                width: 22px;
                height: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #2563eb;
                border-radius: 50%;
                ${isHighlighted ? 'border: 3px solid #FF0000; box-shadow: 0 0 8px rgba(255, 0, 0, 0.8);' : ''}
                cursor: pointer;
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
            `
            : `
              <div style="
                width: 32px;
                height: 32px;
                background-image: url('/images/coffee-bean.png');
                background-size: cover;
                background-position: center;
                border: ${isHighlighted ? '3px solid #FF0000' : 'none'};
                box-shadow: ${isHighlighted ? '0 0 8px rgba(255, 0, 0, 0.8)' : 'none'};
                cursor: pointer;
              "></div>
            `;
      
          const marker = new window.naver.maps.Marker({
            position: position,
            map: mapInstanceRef.current,
            icon: {
              content: iconContent,
              anchor: new window.naver.maps.Point(16, 16),
            },
          });

          // 마커 클릭 이벤트 - 사이드 패널 표시
          window.naver.maps.Event.addListener(marker, 'click', () => {
            if (selectedCafe && selectedCafe.id === cafe.id) {
              setSelectedCafe(null);
            } else {
              setSelectedCafe(cafe);
            }
          });

          markersRef.current.push(marker);
        }
      }
    };

    const initializeMap = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude: currentLat, longitude: currentLng } = position.coords;

        const mapOptions = {
          center: new window.naver.maps.LatLng(currentLat, currentLng),
          zoom: 14,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;
        
        // 전역으로 지도 인스턴스와 메서드 저장
        window.currentMap = map;
        window.moveToCurrentLocation = moveToCurrentLocation;

        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(currentLat, currentLng),
          map: map,
          icon: {
            content: `
              <div style="
                width: 16px;
                height: 16px;
                background: #2563eb;
                border-radius: 50%;
                box-shadow: 0 0 8px rgba(37, 99, 235, 0.8);
                border: 3px solid white;
              "></div>
            `,
            anchor: new window.naver.maps.Point(8, 8),
          },
        });

        // 지도 클릭 시 사이드 패널 닫기
        window.naver.maps.Event.addListener(map, 'click', function() {
          setSelectedCafe(null);
        });

        if (cafes.length > 0) {
          await createCafeMarkers();
        }
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    initializeMap();
    
    // 컴포넌트 언마운트 시 전역 객체 정리
    return () => {
      window.currentMap = null;
      window.moveToCurrentLocation = null;
    };
  }, [cafes, searchKeyword, selectedCafe, favoriteCafes]);

  // 즐겨찾기 정보 로컬 스토리지에서 불러오기
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteCafes');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavoriteCafes(new Set(parsedFavorites));
      } catch (error) {
        console.error('Error parsing favorite cafes:', error);
      }
    }
  }, []);

  // 즐겨찾기 정보 로컬 스토리지에 저장
  useEffect(() => {
    if (favoriteCafes.size > 0) {
      localStorage.setItem('favoriteCafes', JSON.stringify([...favoriteCafes]));
    }
  }, [favoriteCafes]);

  // 카페 정보 사이드 패널 렌더링
  const renderCafeInfo = () => {
    if (!selectedCafe) return null;
    
    const isFavorite = favoriteCafes.has(selectedCafe.id);
    
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg z-10 sm:left-0 sm:top-0 sm:bottom-auto sm:w-1/2 sm:max-w-md">
        {/* 상단 헤더 영역 - 고정 */}
        <div className="sticky top-0 z-20 bg-white p-4 border-b border-gray-200 flex justify-between items-start">
          <h3 className="text-lg font-bold pr-8">
            {selectedCafe.name}
          </h3>
          
          <div className="flex items-center">
            {/* 내 취향 카페로 등록 버튼 (하트 아이콘으로 변경) */}
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 transition-colors ${
                isFavorite 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              onClick={() => {
                toggleFavorite(selectedCafe.id);
                const message = isFavorite
                  ? `${selectedCafe.name} 카페가 취향 목록에서 제거되었습니다.`
                  : `${selectedCafe.name} 카페가 내 취향 목록에 추가되었습니다.`;
                alert(message);
              }}
              title={isFavorite ? "내 취향 목록에서 제거" : "내 취향 카페로 등록"}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                viewBox="0 0 24 24" 
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            
            {/* 닫기 버튼 - 상단에 고정 */}
            <button 
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 flex-shrink-0"
              onClick={() => setSelectedCafe(null)}
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* 스크롤 가능한 내용 영역 */}
        <div className="p-4 max-h-[200px] overflow-y-auto">
          <div className="space-y-2">
            <p className="text-gray-600">{selectedCafe.address}</p>
            <p className="text-gray-600">{selectedCafe.phone}</p>
            {selectedCafe.businessHours && (
              <div>
                <p className="font-medium">영업시간</p>
                <p className="text-gray-600">
                  {Array.isArray(selectedCafe.businessHours) 
                    ? selectedCafe.businessHours.map((hour, index) => (
                        `${hour.day}: ${hour.openTime} - ${hour.closeTime}${index < selectedCafe.businessHours.length - 1 ? '\n' : ''}`
                      )).join('')
                    : selectedCafe.businessHours}
                </p>
              </div>
            )}
            {selectedCafe.description && (
              <p className="text-gray-600">{selectedCafe.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg relative">
      {renderCafeInfo()}
    </div>
  );
}