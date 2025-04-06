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
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
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
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울시청 좌표로 기본값 설정
          zoom: 14,
          zoomControl: true,
          zoomControlOptions: {
            position: window.naver.maps.Position.TOP_RIGHT,
          },
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;
        
        // 전역으로 지도 인스턴스만 저장
        window.currentMap = map;

        // 현재 위치로 가기 버튼 추가
        const locationButton = document.createElement('button');
        locationButton.style.position = 'absolute';
        locationButton.style.bottom = '24px';
        locationButton.style.right = '16px';
        locationButton.style.width = '40px';
        locationButton.style.height = '40px';
        locationButton.style.backgroundColor = 'white';
        locationButton.style.borderRadius = '50%';
        locationButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
        locationButton.style.cursor = 'pointer';
        locationButton.style.border = 'none';
        locationButton.style.zIndex = '100';
        locationButton.title = '현재 위치로 이동';
        locationButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
        
        // 버튼을 지도의 컨테이너에 추가
        const mapContainer = map.getElement();
        mapContainer.appendChild(locationButton);
        
        // 클릭 이벤트 리스너 추가
        locationButton.addEventListener('click', () => {
          if (!mapInstanceRef.current) return;
          
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
      <div className="absolute sm:left-0 sm:top-0 bottom-0 left-0 right-0 sm:w-1/2 sm:max-w-md h-[40vh] sm:h-full bg-white shadow-lg z-10">
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
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <div className="text-xs text-gray-600 mb-4">
            {selectedCafe.description && <p className="mb-2">{selectedCafe.description}</p>}
            <p className="flex items-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {selectedCafe.address}
            </p>
            {selectedCafe.phone && (
              <p className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                {selectedCafe.phone}
              </p>
            )}
          </div>

          {/* 영업시간 정보 */}
          {selectedCafe.businessHours?.length > 0 && (
            <div className="text-xs text-gray-600 mb-4">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div>
                  <div className="font-medium">영업시간</div>
                  {selectedCafe.businessHours.map((hour, idx) => (
                    <p key={idx} className="my-1">
                      {hour.day}: {hour.openTime} - {hour.closeTime}
                    </p>
                  ))}
                  {selectedCafe.businessHourNote && (
                    <p className="mt-2 text-xs italic text-gray-500">
                      {selectedCafe.businessHourNote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SNS 링크 */}
          {selectedCafe.snsLinks?.length > 0 && (
            <div className="text-xs text-gray-600 mb-4">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <div>
                  <div className="font-medium">SNS</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedCafe.snsLinks.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.type}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 구분선 */}
          <div className="h-px bg-gray-200 my-4"></div>

          {/* 커피 정보 */}
          <div className="mt-4">
            <h4 className="font-bold mb-2">원두 정보</h4>
            <div className="space-y-3">
              {selectedCafe.coffees.map((coffee, idx) => {
                const backgroundColor = coffee.noteColors?.[0] || '#f9fafb';
                const bgColorWithOpacity = backgroundColor.includes('rgba') 
                  ? backgroundColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),\s*[\d.]+\)/, 'rgba($1, 0.5)')
                  : backgroundColor.includes('rgb') 
                    ? backgroundColor.replace(/rgb\(/, 'rgba(').replace(/\)/, ', 0.5)')
                    : backgroundColor + '80'; // 16진수에 80을 붙이면 50% 투명도
                
                return (
                  <div 
                    key={idx} 
                    className="border border-gray-200 rounded-lg p-3 text-sm"
                    style={{ backgroundColor: bgColorWithOpacity }}
                  >
                    <div className="font-bold text-gray-800 mb-1">
                      {coffee.name}
                    </div>
                    
                    {coffee.description && (
                      <div className="text-black text-xs mb-2 pb-2 border-b border-gray-600">
                        {coffee.description}
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-black">
                      {coffee.notes?.length > 0 && (
                        <div>
                          <span className="font-medium">컵노트:</span> {coffee.notes.join(', ')}
                        </div>
                      )}

                      {coffee.origins?.length > 0 && (
                        <div>
                          <span className="font-medium">원산지:</span> {coffee.origins.join(', ')}
                        </div>
                      )}
                      
                      {coffee.processes?.length > 0 && (
                        <div>
                          <span className="font-medium">프로세스:</span> {coffee.processes.join(', ')}
                        </div>
                      )}
                      
                      {coffee.brewMethods?.length > 0 && (
                        <div>
                          <span className="font-medium">추출방식:</span> {coffee.brewMethods.join(', ')}
                        </div>
                      )}
                      
                      {coffee.roastLevel?.length > 0 && (
                        <div>
                          <span className="font-medium">로스팅 레벨:</span> {coffee.roastLevel.join(', ')}
                        </div>
                      )}

                      {/* 가격 정보 - 구분선 제거 */}
                      <div className="mt-2">
                        <span className="font-medium">가격:</span> {coffee.price.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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