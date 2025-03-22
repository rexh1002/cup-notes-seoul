'use client';

import React from 'react';
import { Coffee } from 'lucide-react';
import Link from 'next/link';

interface Coffee {
  id: string;
  name: string;
  price: number;
  description?: string;
  roastLevel?: string[];
  origins?: string[];
  processes?: string[];
  notes?: string[];
  brewMethods?: string[];
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  rating?: number;
  distance?: string;
  openUntil?: string;
  cupNotes: string[];
  imageUrl?: string;
  origins: string[];
  processes: string[];
  roastLevel: string[];
  coffees: Coffee[];
  naverMapUrl?: string; // 추가된 필드
}

interface SearchResultsProps {
  isLoading: boolean;
  cafes: Cafe[];
  sortOption: string;
  searchKeywords?: string[]; // 검색어 하이라이팅을 위해 추가
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  isLoading, 
  cafes, 
  sortOption,
  searchKeywords = []
}) => {
  if (isLoading) {
    return <p className="text-gray-600 text-center py-8">검색 중...</p>;
  }

  if (!cafes || cafes.length === 0) {
    return <p className="text-gray-600 text-center py-8">검색 결과가 없습니다.</p>;
  }

  const highlightMatches = (text: string) => {
    if (!searchKeywords.length) return text;
    const regex = new RegExp(`(${searchKeywords.join('|')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  const sortedCafes = [...cafes].sort((a, b) => {
    if (sortOption === 'distance') {
      return (parseFloat(a.distance || '0') || 0) - (parseFloat(b.distance || '0') || 0);
    }
    if (sortOption === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {sortedCafes.map((cafe) => (
        <div key={cafe.id} className="bg-white shadow-md rounded-lg overflow-hidden">
          <Link 
            href={cafe.naverMapUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
          >
            {cafe.imageUrl ? (
              <img
                src={cafe.imageUrl}
                alt={cafe.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                <Coffee className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </Link>

          <div className="p-4">
            <Link 
              href={cafe.naverMapUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 
                className="text-lg font-bold mb-2 hover:text-blue-600"
                dangerouslySetInnerHTML={{ 
                  __html: highlightMatches(cafe.name)
                }}
              />
            </Link>

            <p 
              className="text-sm text-gray-600 mb-4"
              dangerouslySetInnerHTML={{ 
                __html: highlightMatches(cafe.address)
              }}
            />

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">컵 노트</h4>
              <ul className="flex flex-wrap gap-2">
                {cafe.cupNotes.map((note, index) => (
                  <li 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-sm rounded-full"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">원두 종류</h4>
              <ul className="space-y-1">
                {cafe.coffees.map((coffee) => (
                  <li 
                    key={coffee.id} 
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatches(`${coffee.name} (${coffee.roastLevel?.join(', ')})`) 
                    }}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
