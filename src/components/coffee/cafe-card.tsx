'use client';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, Clock, MapPin, Coffee, ExternalLink } from 'lucide-react';

interface Coffee {
  id: string;
  name: string;
  roastLevel: string[];
  origins: string[];
  processes: string[];
  notes: string[];
  brewMethods: string[];
  price: number;
  description?: string;
}

interface CafeCardProps {
  name: string;
  address: string;
  phone?: string;
  description?: string;
  openTime?: string;
  closeTime?: string;
  closedDays?: string[];
  rating: number;
  distance: string;
  openUntil: string;
  cupNotes: string[];
  origins: string[];
  processes: string[];
  roastLevel: string[];
  coffees: Coffee[];
  imageUrl?: string;
  onClick?: () => void;
}

export default function CafeCard({
  name,
  address,
  phone,
  description,
  openTime,
  closeTime,
  closedDays,
  rating,
  distance,
  openUntil,
  cupNotes,
  coffees,
  onClick
}: CafeCardProps) {
  // 네이버 지도 검색 URL 생성 함수
  const getNaverMapUrl = (cafeName: string) => {
    const encodedName = encodeURIComponent(cafeName);
    return `https://map.naver.com/v5/search/${encodedName}`;
  };

  return (
    <div className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* 카페 정보 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium mb-1">{name}</h3>
              <a
                href={getNaverMapUrl(name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-sm text-gray-600">{address}</p>
            {phone && <p className="text-sm text-gray-500">{phone}</p>}
          </div>
          <div className="flex items-center bg-amber-50 px-2 py-1 rounded">
            <Star className="w-4 h-4 text-amber-500 mr-1" />
            <span className="text-amber-700 text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* 영업 시간 정보 */}
        {(openTime || closeTime) && (
          <div className="mb-4 text-sm text-gray-600">
            <p>영업시간: {openTime} - {closeTime}</p>
            {closedDays?.length && closedDays.length > 0 && (
      <p className="text-gray-500">휴무일: {closedDays.join(', ')}</p>
    )}
  </div>
        )}

        {/* 컵 노트 태그 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {cupNotes.map((note) => (
            <Badge
              key={note}
              variant="secondary"
              className="bg-amber-50 text-amber-700 hover:bg-amber-100"
            >
              {note}
            </Badge>
          ))}
        </div>

        {/* 원두 정보 */}
        <div className="mb-4 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-1 text-gray-700">
            <Coffee className="w-4 h-4" />
            판매중인 원두
          </h4>
          <div className="space-y-2">
            {coffees.map((coffee) => (
              <div key={coffee.id} className="border-l-2 border-amber-200 pl-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">{coffee.name}</span>
                  <span className="text-sm text-gray-600">
                    {coffee.price.toLocaleString()}원
                  </span>
                </div>
                {coffee.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {coffee.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {coffee.roastLevel.map((level, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {level}
                    </Badge>
                  ))}
                  {coffee.origins.map((origin, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {origin}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {distance}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {openUntil}
          </span>
        </div>

        {/* 상세보기 버튼 */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onClick}
        >
          VIEW DETAILS
        </Button>
      </div>
    </div>
  );
}