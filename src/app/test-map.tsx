import { useEffect, useRef } from 'react';

export default function TestMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.naver && window.naver.maps && mapRef.current) {
      new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5665, 126.9780),
        zoom: 13,
      });
    }
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ minHeight: '400px', minWidth: '400px', width: '100vw', height: '100vh', background: 'red' }}
    >
      지도 테스트
    </div>
  );
} 