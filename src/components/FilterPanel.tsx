import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSwipeable } from 'react-swipeable';

interface FilterPanelProps {
  selectedNotes: string[];
  toggleNote: (note: string) => void;
  selectedBrewMethods: string[];
  toggleBrewMethod: (method: string) => void;
  selectedOrigins: string[];
  toggleOrigin: (origin: string) => void;
  selectedProcesses: string[];
  toggleProcess: (process: string) => void;
  selectedRoast: string[];
  toggleRoast: (roast: string) => void;
  onReset: () => void;
  onApply: () => void;
  className?: string;
}

export default function FilterPanel({
  selectedNotes,
  toggleNote,
  selectedBrewMethods,
  toggleBrewMethod,
  selectedOrigins,
  toggleOrigin,
  selectedProcesses,
  toggleProcess,
  selectedRoast,
  toggleRoast,
  onReset,
  onApply,
  className
}: FilterPanelProps) {
  // 모바일 탭 상태
  const [mobileTab, setMobileTab] = useState(0);
  const tabLabels = ['추출방식', '원산지', '프로세스', '로스팅레벨'];

  // 모바일 스와이프 핸들러
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setMobileTab((prev) => Math.min(prev + 1, 3)),
    onSwipedRight: () => setMobileTab((prev) => Math.max(prev - 1, 0)),
    trackMouse: true,
  });

  // PC(웹) 화면: 기존 FilterPanel 유지
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return (
      <div className={`fixed w-96 h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl overflow-y-auto z-50 ${className || ''}`}>
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 z-10 p-4 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-extrabold tracking-tight">COFFEE FILTERS</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Brew Method */}
          <section>
            <button
              className={`w-full flex justify-between items-center py-4 px-2 bg-transparent border-none rounded-none shadow-none transition-all text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none group sm:py-2 sm:px-1 sm:text-base`}
              style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}
            >
              <span>Brew Method</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                <button
                  key={method}
                  onClick={() => toggleBrewMethod(method)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium sm:text-xs sm:px-2 sm:py-1 ${
                    selectedBrewMethods.includes(method)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </section>

          {/* Origin */}
          <section>
            <button
              className={`w-full flex justify-between items-center py-4 px-2 bg-transparent border-none rounded-none shadow-none transition-all text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none group sm:py-2 sm:px-1 sm:text-base`}
              style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}
            >
              <span>Origin</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                <button
                  key={origin}
                  onClick={() => toggleOrigin(origin)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium sm:text-xs sm:px-2 sm:py-1 ${
                    selectedOrigins.includes(origin)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {origin}
                </button>
              ))}
            </div>
          </section>

          {/* Process */}
          <section>
            <button
              className={`w-full flex justify-between items-center py-4 px-2 bg-transparent border-none rounded-none shadow-none transition-all text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none group sm:py-2 sm:px-1 sm:text-base`}
              style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}
            >
              <span>Process</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                <button
                  key={process}
                  onClick={() => toggleProcess(process)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium sm:text-xs sm:px-2 sm:py-1 ${
                    selectedProcesses.includes(process)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {process}
                </button>
              ))}
            </div>
          </section>

          {/* Roast Level */}
          <section>
            <button
              className={`w-full flex justify-between items-center py-4 px-2 bg-transparent border-none rounded-none shadow-none transition-all text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none group sm:py-2 sm:px-1 sm:text-base`}
              style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}
            >
              <span>Roast Level</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                <button
                  key={roast}
                  onClick={() => toggleRoast(roast)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium sm:text-xs sm:px-2 sm:py-1 ${
                    selectedRoast.includes(roast)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {roast}
                </button>
              ))}
            </div>
          </section>

          {/* Cup Notes (항상 펼침) */}
          <section>
            <div style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}>
              <span className="w-full flex justify-between items-center py-4 px-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white group sm:py-2 sm:px-1 sm:text-base">Cup Notes</span>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              {/* Floral (항상 펼침) */}
              <div className="rounded-xl shadow bg-white/80 dark:bg-gray-800">
                <div className="relative w-full h-16 flex items-center rounded-xl overflow-hidden group focus:outline-none">
                  <Image src="/images/Floral.jpg" alt="Floral" fill className="object-cover group-hover:scale-105 transition-transform duration-300" style={{ zIndex: 1 }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/60 via-white/10 to-yellow-200/60 group-hover:bg-pink-300/70 transition-colors duration-300" style={{ zIndex: 2 }} />
                  <span className="relative z-10 text-xl font-bold text-white drop-shadow-lg pl-6">Floral</span>
                </div>
                <div className="flex flex-nowrap overflow-x-auto gap-2 content-start px-4 pb-4 pt-2 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
                  {[
                    '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'
                  ].map((note) => (
                    <button
                      key={note}
                      onClick={() => toggleNote(note)}
                      className={`text-sm px-4 py-2 rounded-full shadow transition-colors font-medium sm:text-xs sm:px-2 sm:py-1 ${
                        selectedNotes.includes(note)
                          ? 'bg-gradient-to-r from-pink-400 to-yellow-300 text-gray-900 shadow-lg scale-105'
                          : 'bg-white/80 text-gray-900 hover:bg-pink-50 hover:scale-105'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>
              {/* Fruity (항상 펼침) */}
              <div className="rounded-xl shadow bg-white/80 dark:bg-gray-800">
                <div className="relative w-full h-16 flex items-center rounded-xl overflow-hidden group focus:outline-none">
                  <Image src="/images/Fruity.jpg" alt="Fruity" fill className="object-cover group-hover:scale-105 transition-transform duration-300" style={{ zIndex: 1 }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 via-white/10 to-pink-400/60 group-hover:bg-yellow-300/70 transition-colors duration-300" style={{ zIndex: 2 }} />
                  <span className="relative z-10 text-xl font-bold text-white drop-shadow-lg pl-6">Fruity</span>
                </div>
                <div className="flex flex-nowrap overflow-x-auto gap-2 content-start px-4 pb-4 pt-2 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
                  {[
                    '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'
                  ].map((note) => (
                    <button
                      key={note}
                      onClick={() => toggleNote(note)}
                      className={`text-sm px-4 py-2 rounded-full shadow transition-colors font-medium sm:text-xs sm:px-2 sm:py-1 ${
                        selectedNotes.includes(note)
                          ? 'bg-gradient-to-r from-yellow-300 to-pink-400 text-gray-900 shadow-lg scale-105'
                          : 'bg-white/80 text-gray-900 hover:bg-yellow-50 hover:scale-105'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>
              {/* Nutty (항상 펼침) */}
              <div className="rounded-xl shadow bg-white/80 dark:bg-gray-800">
                <div className="relative w-full h-16 flex items-center rounded-xl overflow-hidden group focus:outline-none">
                  <Image src="/images/Nutty.jpg" alt="Nutty" fill className="object-cover group-hover:scale-105 transition-transform duration-300" style={{ zIndex: 1 }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 via-white/10 to-amber-700/60 group-hover:bg-yellow-300/70 transition-colors duration-300" style={{ zIndex: 2 }} />
                  <span className="relative z-10 text-xl font-bold text-white drop-shadow-lg pl-6">Nutty</span>
                </div>
                <div className="flex flex-nowrap overflow-x-auto gap-2 content-start px-4 pb-4 pt-2 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
                  {[
                    '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스'
                  ].map((note) => (
                    <button
                      key={note}
                      onClick={() => toggleNote(note)}
                      className={`text-sm px-4 py-2 rounded-full shadow transition-colors font-medium sm:text-xs sm:px-2 sm:py-1 ${
                        selectedNotes.includes(note)
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-700 text-gray-900 shadow-lg scale-105'
                          : 'bg-white/80 text-gray-900 hover:bg-yellow-50 hover:scale-105'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between backdrop-blur-md">
          <button onClick={onReset} className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Reset</button>
          <button onClick={onApply} className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all">Apply</button>
        </div>
      </div>
    );
  }

  // 모바일 화면: 탭 UI + 탭별 항목
  return (
    <div className={`w-full min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto pb-20 ${className || ''}`}> 
      {/* 상단 탭 메뉴 */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 flex border-b border-indigo-200">
        {tabLabels.map((label, idx) => (
          <button
            key={label}
            className={`flex-1 py-4 text-base font-bold transition-colors ${mobileTab === idx ? 'text-indigo-700 border-b-2 border-indigo-700 bg-white' : 'text-gray-400 bg-transparent'}`}
            onClick={() => setMobileTab(idx)}
          >
            {label}
          </button>
        ))}
      </div>
      {/* 탭별 컨텐츠 */}
      <div {...swipeHandlers} className="px-2 pt-4">
        {mobileTab === 0 && (
          <section>
            <div className="mb-2 text-lg font-bold text-indigo-700">추출방식</div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-4">
              {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                <button
                  key={method}
                  onClick={() => toggleBrewMethod(method)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${selectedBrewMethods.includes(method) ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </section>
        )}
        {mobileTab === 1 && (
          <section>
            <div className="mb-2 text-lg font-bold text-indigo-700">원산지</div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-4">
              {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                <button
                  key={origin}
                  onClick={() => toggleOrigin(origin)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${selectedOrigins.includes(origin) ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'}`}
                >
                  {origin}
                </button>
              ))}
            </div>
          </section>
        )}
        {mobileTab === 2 && (
          <section>
            <div className="mb-2 text-lg font-bold text-indigo-700">프로세스</div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-4">
              {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                <button
                  key={process}
                  onClick={() => toggleProcess(process)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${selectedProcesses.includes(process) ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'}`}
                >
                  {process}
                </button>
              ))}
            </div>
          </section>
        )}
        {mobileTab === 3 && (
          <section>
            <div className="mb-2 text-lg font-bold text-indigo-700">로스팅레벨</div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 pb-4">
              {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                <button
                  key={roast}
                  onClick={() => toggleRoast(roast)}
                  className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${selectedRoast.includes(roast) ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'}`}
                >
                  {roast}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between backdrop-blur-md z-30">
        <button onClick={onReset} className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Reset</button>
        <button onClick={onApply} className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all">Apply</button>
      </div>
    </div>
  );
} 