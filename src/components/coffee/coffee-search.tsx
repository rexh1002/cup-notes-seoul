'use client';

import React, { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Search, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible"

export interface SearchParams {
  keyword?: string;
  notes: string[];
  origins: string[];
  processes: string[];
  roastLevel: string[];
  brewMethod: string[];
}

interface CoffeeSearchProps {
  onSearch: (params: SearchParams) => void;
}

export const CoffeeSearch: React.FC<CoffeeSearchProps> = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedRoast, setSelectedRoast] = useState<string[]>([]);
  const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>([]);

  const categories = {
    floral: ['라벤더', '아카시아', '장미', '자스민'],
    fruity: ['파인애플', '복숭아', '리치', '사과'],
    nutty: ['초콜릿', '캐러멜', '땅콩', '호두']
  };

  const origins = ['에티오피아', '콜롬비아', '브라질'];
  const processes = ['워시드', '내추럴', '허니'];
  const roastLevels = ['약배전', '중배전', '강배전'];
  const brewMethods = ['핸드드립', '에스프레소', '콜드브루'];

  const toggleItem = (item: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      keyword: searchKeyword,
      notes: selectedNotes,
      origins: selectedOrigins,
      processes: selectedProcesses,
      roastLevel: selectedRoast,
      brewMethod: selectedBrewMethods,
    };
    onSearch(searchParams);
  };

  return (
    <div className="w-full space-y-6">
      {/* 검색창 */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="키워드 검색"
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          <Search className="inline-block w-4 h-4 mr-1" />
          검색
        </button>
      </div>

      {/* 노트 선택 */}
      <div className="space-y-4">
        {Object.entries(categories).map(([category, notes]) => (
          <div key={category}>
            <h3 className="font-bold">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {notes.map(note => (
                <button
                  key={note}
                  onClick={() => toggleItem(note, setSelectedNotes)}
                  className={`px-3 py-1 rounded-full border ${
                    selectedNotes.includes(note) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 추가 옵션 */}
      <Collapsible>
        <CollapsibleTrigger className="text-lg font-medium">추가 옵션</CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-4">
            {/* 원산지 */}
            <div>
              <h4 className="font-bold">원산지</h4>
              <div className="flex flex-wrap gap-2">
                {origins.map(origin => (
                  <button
                    key={origin}
                    onClick={() => toggleItem(origin, setSelectedOrigins)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedOrigins.includes(origin) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </div>

            {/* 프로세스 */}
            <div>
              <h4 className="font-bold">프로세스</h4>
              <div className="flex flex-wrap gap-2">
                {processes.map(process => (
                  <button
                    key={process}
                    onClick={() => toggleItem(process, setSelectedProcesses)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedProcesses.includes(process) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {process}
                  </button>
                ))}
              </div>
            </div>

            {/* 로스팅 */}
            <div>
              <h4 className="font-bold">로스팅</h4>
              <div className="flex flex-wrap gap-2">
                {roastLevels.map(roast => (
                  <button
                    key={roast}
                    onClick={() => toggleItem(roast, setSelectedRoast)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedRoast.includes(roast) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {roast}
                  </button>
                ))}
              </div>
            </div>

            {/* 추출 방식 */}
            <div>
              <h4 className="font-bold">추출 방식</h4>
              <div className="flex flex-wrap gap-2">
                {brewMethods.map(method => (
                  <button
                    key={method}
                    onClick={() => toggleItem(method, setSelectedBrewMethods)}
                    className={`px-3 py-1 rounded-full border ${
                      selectedBrewMethods.includes(method) ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CoffeeSearch;
