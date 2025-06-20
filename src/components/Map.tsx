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
    currentMap: any;
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
  currentLocation?: { lat: number; lng: number } | null;
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
  currentLocation,
}, ref) {
  console.log('[Map] 컴포넌트 렌더링', { cafes: cafes.length, center: initialCenter, zoom: initialZoom });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const eventListenersRef = useRef<any[]>([]);
  const currentLocationMarkerRef = useRef<any>(null);
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
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchMoveX, setTouchMoveX] = useState(0);
  const [dragTranslateX, setDragTranslateX] = useState(0);
  const [canDragHorizontal, setCanDragHorizontal] = useState(false);
  const tabMenuRef = useRef<HTMLDivElement>(null);
  const [showList, setShowList] = useState(false);
  const [cardPosition, setCardPosition] = useState<'min' | 'default' | 'full'>('default');

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
          minZoom: 6,
          maxZoom: 21,
          scaleControl: false,
          mapDataControl: false,
          zoomControl: false,
          locationControl: true, // 내장 현재위치 버튼 활성화
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
        window.currentMap = mapInstance.current;
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

          // 기존 center에서 마커 좌표로 1/10만 이동
          const currentCenter = mapInstance.current.getCenter();
          const deltaLat = coord.lat - currentCenter.lat();
          const deltaLng = coord.lng - currentCenter.lng();
          const movedLat = currentCenter.lat() + deltaLat * 0.1;
          const movedLng = currentCenter.lng() + deltaLng * 0.1;
          const movedCenter = new window.naver.maps.LatLng(movedLat, movedLng);
          mapInstance.current.setCenter(movedCenter);
          setCenter({ lat: movedLat, lng: movedLng });
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

  // 현재 위치 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.naver || !window.naver.maps || !currentLocation) return;

    // 기존 현재 위치 마커 제거
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }

    // 새로운 현재 위치 마커 생성
    const markerOptions = {
      position: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
      map: mapInstance.current,
      icon: {
        content: `
          <div style="
            width: 17px; /* 24px * 0.7 */
            height: 17px;
            background-color: #2563eb;
            border: 2px solid white; /* 4px * 0.5 */
            border-radius: 50%;
            box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.5); /* 2px * 3, 더 불투명하게 */
          "></div>
        `,
        anchor: new window.naver.maps.Point(8.5, 8.5)
      }
    };

    currentLocationMarkerRef.current = new window.naver.maps.Marker(markerOptions);
  }, [currentLocation]);

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

  // 화살표 클릭 이벤트 리스너 추가
  useEffect(() => {
    const handlePrevCafe = () => {
      if (!selectedCafe) return;
      const currentCafeIndex = cafes.findIndex(cafe => cafe.id === selectedCafe.id);
      if (currentCafeIndex > 0) {
        const prevCafe = cafes[currentCafeIndex - 1];
        setSelectedCafe(prevCafe);
        // 이전 카페 마커로 중심 이동
        getCoordinates(prevCafe.address).then(coord => {
          if (coord && mapInstance.current && window.naver && window.naver.maps) {
            const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
            mapInstance.current.setCenter(newCenter);
            setCenter({ lat: coord.lat, lng: coord.lng });
          }
        });
      }
    };

    const handleNextCafe = () => {
      if (!selectedCafe) return;
      const currentCafeIndex = cafes.findIndex(cafe => cafe.id === selectedCafe.id);
      if (currentCafeIndex < cafes.length - 1) {
        const nextCafe = cafes[currentCafeIndex + 1];
        setSelectedCafe(nextCafe);
        // 다음 카페 마커로 중심 이동
        getCoordinates(nextCafe.address).then(coord => {
          if (coord && mapInstance.current && window.naver && window.naver.maps) {
            const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
            mapInstance.current.setCenter(newCenter);
            setCenter({ lat: coord.lat, lng: coord.lng });
          }
        });
      }
    };

    window.addEventListener('prevCafe', handlePrevCafe);
    window.addEventListener('nextCafe', handleNextCafe);

    return () => {
      window.removeEventListener('prevCafe', handlePrevCafe);
      window.removeEventListener('nextCafe', handleNextCafe);
    };
  }, [selectedCafe, cafes, getCoordinates]);

  // CafeTabMenu 컴포넌트 추가
  function CafeTabMenu({ selectedTab, setSelectedTab }: { selectedTab: 'beans' | 'info'; setSelectedTab: (tab: 'beans' | 'info') => void }) {
    const handlePrevCafe = () => {
      // 이전 카페로 이동하는 로직은 부모 컴포넌트에서 처리
      const event = new CustomEvent('prevCafe');
      window.dispatchEvent(event);
    };

    const handleNextCafe = () => {
      // 다음 카페로 이동하는 로직은 부모 컴포넌트에서 처리
      const event = new CustomEvent('nextCafe');
      window.dispatchEvent(event);
    };

    return (
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10 relative">
        <button
          className={`flex-1 py-3 text-center font-bold ${selectedTab === 'beans' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedTab('beans');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedTab('beans');
          }}
        >
          원두 라인업
        </button>
        <button
          className={`flex-1 py-3 text-center font-bold ${selectedTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-400'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedTab('info');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedTab('info');
          }}
        >
          카페 정보
        </button>
        {/* 모바일에서만 좌우 화살표 표시 */}
        {typeof window !== 'undefined' && window.innerWidth < 768 && (
          <>
            {/* 왼쪽 화살표 */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevCafe();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrevCafe();
              }}
            >
              <div className="w-8 h-8 bg-gray-600/70 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 12L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
            {/* 오른쪽 화살표 */}
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNextCafe();
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNextCafe();
              }}
            >
              <div className="w-8 h-8 bg-gray-600/70 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L18 12L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </>
        )}
      </div>
    );
  }

  // 터치 이벤트 핸들러
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      const touchDiffY = touchMoveY - touchStartY;
      const touchDiffX = touchMoveX - touchStartX;
      
      setDragTranslateY(0);
      setDragTranslateX(0);
      
      // 수직 드래그 처리
      if (canDrag && Math.abs(touchDiffY) > Math.abs(touchDiffX)) {
        if (cardPosition === 'default') {
          if (touchDiffY < -100) setCardPosition('full');
          else if (touchDiffY > 100) setCardPosition('min');
        } else if (cardPosition === 'full') {
          if (touchDiffY > 100) setCardPosition('default');
        } else if (cardPosition === 'min') {
          if (touchDiffY < -100) setCardPosition('default');
        }
      }
      
      // 수평 드래그 처리
      if (canDragHorizontal && Math.abs(touchDiffX) > Math.abs(touchDiffY) && Math.abs(touchDiffX) > 50) {
        const currentCafeIndex = cafes.findIndex(cafe => cafe.id === selectedCafe?.id);
        if (touchDiffX > 0 && currentCafeIndex > 0) {
          // 오른쪽으로 드래그 - 이전 카페
          const prevCafe = cafes[currentCafeIndex - 1];
          setSelectedCafe(prevCafe);
          // 이전 카페 마커로 중심 이동
          getCoordinates(prevCafe.address).then(coord => {
            if (coord && mapInstance.current && window.naver && window.naver.maps) {
              const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
              mapInstance.current.setCenter(newCenter);
              setCenter({ lat: coord.lat, lng: coord.lng });
            }
          });
        } else if (touchDiffX < 0 && currentCafeIndex < cafes.length - 1) {
          // 왼쪽으로 드래그 - 다음 카페
          const nextCafe = cafes[currentCafeIndex + 1];
          setSelectedCafe(nextCafe);
          // 다음 카페 마커로 중심 이동
          getCoordinates(nextCafe.address).then(coord => {
            if (coord && mapInstance.current && window.naver && window.naver.maps) {
              const newCenter = new window.naver.maps.LatLng(coord.lat, coord.lng);
              mapInstance.current.setCenter(newCenter);
              setCenter({ lat: coord.lat, lng: coord.lng });
            }
          });
        }
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) {
      // 탭 영역에서 터치가 시작되면 드래그 무시
      if (tabMenuRef.current && tabMenuRef.current.contains(e.target as Node)) {
        setCanDrag(false);
        setCanDragHorizontal(false);
        return;
      }
      setCanDrag(true);
      setCanDragHorizontal(true);
      e.preventDefault();
      const touch = e.touches[0];
      setTouchStartY(touch.clientY);
      setTouchMoveY(touch.clientY);
      setTouchStartX(touch.clientX);
      setTouchMoveX(touch.clientX);
      setDragTranslateY(0);
      setDragTranslateX(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      const touch = e.touches[0];
      const currentY = touch.clientY;
      const currentX = touch.clientX;
      const deltaY = (currentY - touchStartY) * 0.5;
      const deltaX = (currentX - touchStartX) * 0.5;
      
      setTouchMoveY(currentY);
      setTouchMoveX(currentX);
      
      // 수직 드래그 처리
      if (canDrag) {
        // 전체화면 상태에서는 위로 드래그 방지
        if (isFullScreen && deltaY < 0) return;
        setDragTranslateY(deltaY);
      }
      
      // 수평 드래그 처리
      if (canDragHorizontal) {
        setDragTranslateX(deltaX);
      }
    }
  };

  return (
    <>
      <Script
        src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=3i3sds8j5s&submodules=geocoder"
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
          window.innerWidth < 768 ? (
            // 모바일: 기존처럼 하단 고정
            <div
              className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg z-[88888] transition-transform duration-1500 ease-in-out md:relative md:rounded-none md:shadow-none
                ${cardPosition === 'full' ? 'h-[calc(100vh-64px)]' : cardPosition === 'default' ? 'h-[40vh]' : 'h-[25vh]'}
              `}
              style={{
                transform: `translateY(${dragTranslateY}px) translateX(${dragTranslateX}px)`,
                touchAction: 'none'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* 닫기 버튼 - 모바일 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCafe(null);
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 text-2xl z-20 p-0 m-0 bg-transparent border-none shadow-none focus:outline-none"
                aria-label="카드 닫기"
                style={{
                  background: 'rgba(60,60,60,0.85)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  border: 'none',
                  padding: 0,
                  margin: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="5" y1="5" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="15" y1="5" x2="5" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {/* 드래그 핸들 (상단 바) */}
              <div
                className="w-full h-6 bg-white rounded-t-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'none' }}
              >
                <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
              </div>
              {/* 이미지 섹션 및 이미지 위 텍스트 추가 */}
              {selectedCafe.imageUrl && (
                <div className="w-full relative rounded-t-2xl overflow-hidden group sm:h-[175px] md:h-[175px]"
                  style={typeof window !== 'undefined' && window.innerWidth < 640
                    ? { height: '3.7cm' }
                    : { height: '44px' }
                  }
                >
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
                  {/* 이미지 왼쪽 하단에 카페명/주소 표시 */}
                  <div className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 z-10">
                    <div className="text-white font-bold text-2xl sm:text-3xl drop-shadow-lg leading-tight">{selectedCafe.name}</div>
                    <div className="text-gray-200 text-sm sm:text-base font-medium drop-shadow-md mt-1">{selectedCafe.address}</div>
                  </div>
                </div>
              )}
              {/* 탭 상태 및 메뉴 (드래그 핸들/이미지 아래에 배치) */}
              <div style={{ marginTop: '0px' }} ref={tabMenuRef}>
                <CafeTabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
              </div>
              {/* 탭별 내용 */}
              <div 
                className="flex-1 overflow-y-auto px-2 pb-8 leading-relaxed"
                style={{ 
                  touchAction: 'none',
                  overscrollBehavior: 'contain'
                }}
                onTouchStart={(e) => {
                  if (window.innerWidth < 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    const touch = e.touches[0];
                    setTouchStartY(touch.clientY);
                    setTouchMoveY(touch.clientY);
                    setDragTranslateY(0);
                    setCanDrag(true);
                  }
                }}
                onTouchMove={(e) => {
                  if (window.innerWidth < 768 && canDrag) {
                    e.preventDefault();
                    e.stopPropagation();
                    const touch = e.touches[0];
                    const currentY = touch.clientY;
                    const deltaY = (currentY - touchStartY) * 0.5;
                    
                    // 아래로 드래그할 때만 카드 이동
                    if (deltaY > 0) {
                      setTouchMoveY(currentY);
                      setDragTranslateY(deltaY);
                    }
                  }
                }}
                onTouchEnd={(e) => {
                  if (window.innerWidth < 768 && canDrag) {
                    e.preventDefault();
                    e.stopPropagation();
                    const touchDiff = touchMoveY - touchStartY;
                    setDragTranslateY(0);
                    if (cardPosition === 'default') {
                      if (touchDiff > 100) setCardPosition('min');
                    } else if (cardPosition === 'full') {
                      if (touchDiff > 100) setCardPosition('default');
                    } else if (cardPosition === 'min') {
                      if (touchDiff < -100) setCardPosition('default');
                    }
                  }
                }}
              >
                {selectedTab === 'beans' ? (
                  selectedCafe.coffees && selectedCafe.coffees.length > 0 && (
                    <div 
                      className="cafe-scroll-area flex-1 overflow-y-auto px-4 pb-24 sm:px-1 sm:pb-16 leading-relaxed"
                      style={{ 
                        touchAction: 'pan-y',
                        overscrollBehavior: 'contain',
                        maxHeight: 'calc(100vh - 400px)'
                      }}
                    >
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
                              <span className="text-sm font-semibold leading-tight text-gray-700 sm:text-xs"
                                style={{ minWidth: '70px', textAlign: 'right', display: 'inline-block' }}
                              >
                                {coffee.price?.toLocaleString()}원
                              </span>
                            </div>
                            {/* 원두 설명 */}
                            {coffee.description && (
                              <p className="text-sm text-gray-700 mb-0.5 leading-tight sm:text-xs">
                                {coffee.description}
                              </p>
                            )}
                            {/* 1줄: 컵노트 */}
                            {coffee.notes && coffee.notes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-0.5">
                                {coffee.notes.map((note, idx) => (
                                  <span
                                    key={`note-${idx}`}
                                    className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    {note}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* 2줄: 추출방식, 원산지, 가공방식, 로스팅레벨 */}
                            <div className="flex flex-wrap gap-1 mb-0.5">
                              {coffee.brewMethods?.map((method, idx) => (
                                <span
                                  key={`brew-${idx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                                >
                                  {method}
                                </span>
                              ))}
                              {coffee.origins?.map((origin, idx) => (
                                <span
                                  key={`origin-${idx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                                >
                                  {origin}
                                </span>
                              ))}
                              {coffee.processes?.map((process, idx) => (
                                <span
                                  key={`process-${idx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                                >
                                  {process}
                                </span>
                              ))}
                              {coffee.roastLevel?.map((level, idx) => (
                                <span
                                  key={`roast-${idx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                                >
                                  {level}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ) : (
                  <div 
                    className="flex-1 overflow-y-auto px-2 pb-8 leading-relaxed"
                    style={{ 
                      touchAction: 'none',
                      overscrollBehavior: 'contain'
                    }}
                    onTouchStart={(e) => {
                      if (window.innerWidth < 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        const touch = e.touches[0];
                        setTouchStartY(touch.clientY);
                        setTouchMoveY(touch.clientY);
                        setDragTranslateY(0);
                        setCanDrag(true);
                      }
                    }}
                    onTouchMove={(e) => {
                      if (window.innerWidth < 768 && canDrag) {
                        e.preventDefault();
                        e.stopPropagation();
                        const touch = e.touches[0];
                        const currentY = touch.clientY;
                        const deltaY = (currentY - touchStartY) * 0.5;
                        
                        // 아래로 드래그할 때만 카드 이동
                        if (deltaY > 0) {
                          setTouchMoveY(currentY);
                          setDragTranslateY(deltaY);
                        }
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (window.innerWidth < 768 && canDrag) {
                        e.preventDefault();
                        e.stopPropagation();
                        const touchDiff = touchMoveY - touchStartY;
                        setDragTranslateY(0);
                        if (cardPosition === 'default') {
                          if (touchDiff > 100) setCardPosition('min');
                        } else if (cardPosition === 'full') {
                          if (touchDiff > 100) setCardPosition('default');
                        } else if (cardPosition === 'min') {
                          if (touchDiff < -100) setCardPosition('default');
                        }
                      }
                    }}
                  >
                    {/* 최근수정일 정보 (웹, info 탭 최상단) */}
                    {selectedCafe.updatedAt && (
                      <div className="flex items-center justify-end mb-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {`최근수정일 : ${new Date(selectedCafe.updatedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}`}
                        </span>
                      </div>
                    )}
                    {/* 카페 정보 표시 영역 */}
                    <div className="space-y-3">
                      {/* 주소 */}
                      {selectedCafe.address && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{selectedCafe.address}</span>
                        </div>
                      )}
                      {/* 전화번호 */}
                      {selectedCafe.phone && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{selectedCafe.phone}</span>
                        </div>
                      )}
                      {/* 영업시간 */}
                      {selectedCafe.businessHours && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <Clock className="w-4 h-4 inline-block" />
                          <span
                            dangerouslySetInnerHTML={{
                              __html: Array.isArray(selectedCafe.businessHours)
                                ? selectedCafe.businessHours
                                    .map(hour =>
                                      hour && typeof hour === 'object' && 'day' in hour && 'openTime' in hour && 'closeTime' in hour
                                        ? `${hour.day}: ${hour.openTime} - ${hour.closeTime}`
                                        : JSON.stringify(hour)
                                    )
                                    .join('<br/>')
                                : typeof selectedCafe.businessHours === 'string'
                                  ? selectedCafe.businessHours
                                  : String(selectedCafe.businessHours)
                            }}
                          />
                        </div>
                      )}
                      {/* 영업시간 비고 */}
                      {selectedCafe.businessHourNote && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <Info className="w-4 h-4 text-yellow-500" />
                          <span>{selectedCafe.businessHourNote}</span>
                        </div>
                      )}
                      {/* 설명 */}
                      {selectedCafe.description && (
                        <div className="flex items-start gap-2 text-gray-800 text-sm">
                          <MessageCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                          <span>{selectedCafe.description}</span>
                        </div>
                      )}
                      {/* SNS 링크 */}
                      {selectedCafe.snsLinks && Array.isArray(selectedCafe.snsLinks) && selectedCafe.snsLinks.length > 0 && (
                        <div 
                          className="flex items-center gap-2 text-gray-800 text-sm flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                        >
                          <Share2 className="w-4 h-4 text-pink-500" />
                          {selectedCafe.snsLinks.map((link: any, idx: number) => (
                            link.url ? (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600 mr-2 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (link.url) {
                                    window.location.href = link.url;
                                  }
                                }}
                                onTouchStart={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (link.url) {
                                    window.location.href = link.url;
                                  }
                                }}
                              >
                                {link.type || 'SNS'}
                              </a>
                            ) : null
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // 웹: 오른쪽 영역에 고정
            <div
              className="fixed top-20 right-8 w-[420px] h-[calc(100vh-128px)] bg-white rounded-2xl shadow-2xl z-[88888] flex flex-col border border-gray-200 animate-fade-in"
              style={{ maxHeight: 'calc(100vh - 128px)' }}
            >
              {/* 닫기 버튼 - 웹 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCafe(null);
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 text-2xl z-20 p-0 m-0 bg-transparent border-none shadow-none focus:outline-none"
                aria-label="카드 닫기"
                style={{
                  background: 'rgba(60,60,60,0.85)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
                  border: 'none',
                  padding: 0,
                  margin: 0
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="5" y1="5" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="15" y1="5" x2="5" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {/* 이미지 섹션 및 이미지 위 텍스트 추가 */}
              {selectedCafe.imageUrl && (
                <div className="w-full relative rounded-t-2xl overflow-hidden group h-[180px]">
                  <Image
                    src={selectedCafe.imageUrl}
                    alt={selectedCafe.name}
                    width={480}
                    height={180}
                    sizes="(max-width: 768px) 100vw, 480px"
                    priority
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {/* 이미지 왼쪽 하단에 카페명/주소 표시 */}
                  <div className="absolute left-4 bottom-4 z-10">
                    <div className="text-white font-bold text-2xl drop-shadow-lg leading-tight">{selectedCafe.name}</div>
                    <div className="text-gray-200 text-sm font-medium drop-shadow-md mt-1">{selectedCafe.address}</div>
                  </div>
                </div>
              )}
              {/* 탭 상태 및 메뉴 (이미지 아래에 배치) */}
              <div style={{ marginTop: '0px' }} ref={tabMenuRef}>
                <CafeTabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
              </div>
              {/* 탭별 내용 */}
              <div className="flex-1 overflow-y-auto px-4 pb-8 leading-relaxed">
                {selectedTab === 'beans' ? (
                  selectedCafe.coffees && selectedCafe.coffees.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-end mb-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {selectedCafe.updatedAt ? `최근수정일 : ${new Date(selectedCafe.updatedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}` : ''}
                        </span>
                      </div>
                      {selectedCafe.coffees.map((coffee) => (
                        <div
                          key={coffee.id}
                          className="relative rounded-xl pt-4 pb-2 px-4 shadow bg-white/70 backdrop-blur border border-white/40 flex flex-col gap-0.5 transition-transform hover:-translate-y-1 hover:shadow-xl"
                          style={{
                            backgroundColor: coffee.noteColors?.[0] || 'rgba(255,255,255,0.7)',
                            boxShadow: '0 2px 8px 0 rgba(80,80,120,0.10), inset 0 1px 2px rgba(0,0,0,0.08)'
                          }}
                        >
                          {/* 원두 이름과 가격 */}
                          <div className="flex justify-between items-center mb-0.5">
                            <h5 className="text-base font-bold leading-tight text-gray-900">{coffee.name}</h5>
                            <span className="text-sm font-semibold leading-tight text-gray-700"
                              style={{ minWidth: '70px', textAlign: 'right', display: 'inline-block' }}
                            >
                              {coffee.price?.toLocaleString()}원
                            </span>
                          </div>
                          {/* 원두 설명 */}
                          {coffee.description && (
                            <p className="text-sm text-gray-700 mb-0.5 leading-tight">
                              {coffee.description}
                            </p>
                          )}
                          {/* 1줄: 컵노트 */}
                          {coffee.notes && coffee.notes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-0.5">
                              {coffee.notes.map((note, idx) => (
                                <span
                                  key={`note-${idx}`}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {note}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* 2줄: 추출방식, 원산지, 가공방식, 로스팅레벨 */}
                          <div className="flex flex-wrap gap-1 mb-0.5">
                            {coffee.brewMethods?.map((method, idx) => (
                              <span
                                key={`brew-${idx}`}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                              >
                                {method}
                              </span>
                            ))}
                            {coffee.origins?.map((origin, idx) => (
                              <span
                                key={`origin-${idx}`}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                              >
                                {origin}
                              </span>
                            ))}
                            {coffee.processes?.map((process, idx) => (
                              <span
                                key={`process-${idx}`}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                              >
                                {process}
                              </span>
                            ))}
                            {coffee.roastLevel?.map((level, idx) => (
                              <span
                                key={`roast-${idx}`}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 text-gray-700 border border-gray-200"
                              >
                                {level}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex-1 overflow-y-auto px-2 pb-8 leading-relaxed">
                    {/* 최근수정일 정보 (웹, info 탭 최상단) */}
                    {selectedCafe.updatedAt && (
                      <div className="flex items-center justify-end mb-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {`최근수정일 : ${new Date(selectedCafe.updatedAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}`}
                        </span>
                      </div>
                    )}
                    {/* 카페 정보 표시 영역 */}
                    <div className="space-y-3">
                      {/* 주소 */}
                      {selectedCafe.address && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{selectedCafe.address}</span>
                        </div>
                      )}
                      {/* 전화번호 */}
                      {selectedCafe.phone && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{selectedCafe.phone}</span>
                        </div>
                      )}
                      {/* 영업시간 */}
                      {selectedCafe.businessHours && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <Clock className="w-4 h-4 inline-block" />
                          <span
                            dangerouslySetInnerHTML={{
                              __html: Array.isArray(selectedCafe.businessHours)
                                ? selectedCafe.businessHours
                                    .map(hour =>
                                      hour && typeof hour === 'object' && 'day' in hour && 'openTime' in hour && 'closeTime' in hour
                                        ? `${hour.day}: ${hour.openTime} - ${hour.closeTime}`
                                        : JSON.stringify(hour)
                                    )
                                    .join('<br/>')
                                : typeof selectedCafe.businessHours === 'string'
                                  ? selectedCafe.businessHours
                                  : String(selectedCafe.businessHours)
                            }}
                          />
                        </div>
                      )}
                      {/* 영업시간 비고 */}
                      {selectedCafe.businessHourNote && (
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <Info className="w-4 h-4 text-yellow-500" />
                          <span>{selectedCafe.businessHourNote}</span>
                        </div>
                      )}
                      {/* 설명 */}
                      {selectedCafe.description && (
                        <div className="flex items-start gap-2 text-gray-800 text-sm">
                          <MessageCircle className="w-4 h-4 text-purple-500 mt-0.5" />
                          <span>{selectedCafe.description}</span>
                        </div>
                      )}
                      {/* SNS 링크 */}
                      {selectedCafe.snsLinks && Array.isArray(selectedCafe.snsLinks) && selectedCafe.snsLinks.length > 0 && (
                        <div 
                          className="flex items-center gap-2 text-gray-800 text-sm flex-wrap"
                          onClick={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                        >
                          <Share2 className="w-4 h-4 text-pink-500" />
                          {selectedCafe.snsLinks.map((link: any, idx: number) => (
                            link.url ? (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-blue-600 mr-2 cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (link.url) {
                                    window.location.href = link.url;
                                  }
                                }}
                                onTouchStart={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (link.url) {
                                    window.location.href = link.url;
                                  }
                                }}
                              >
                                {link.type || 'SNS'}
                              </a>
                            ) : null
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ),
          document.body
        )}
      </div>
    </>
  );
});

export default Map;