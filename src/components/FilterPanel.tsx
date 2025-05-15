import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSwipeable } from 'react-swipeable';
import { Coffee as CoffeeIcon, CupSoda as EspressoIcon, IceCream2 as IceIcon, Globe as GlobeIcon, Settings as SettingsIcon, Flame as FlameIcon } from 'lucide-react';

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
  mobileCombined?: boolean;
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
  className,
  mobileCombined
}: FilterPanelProps) {
  // 모바일 탭 상태
  const [mobileTab, setMobileTab] = useState(0);
  const tabLabels = ['Coffee Filters', 'Cup Notes'];

  // 모바일 스와이프 핸들러
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setMobileTab((prev) => Math.min(prev + 1, 1)),
    onSwipedRight: () => setMobileTab((prev) => Math.max(prev - 1, 0)),
    trackMouse: true,
  });

  // PC(웹) 화면: 기존 FilterPanel 유지
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return (
      <div className={`fixed w-96 h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl overflow-y-auto z-50 ${className || ''}`}>
        <div className="p-6 space-y-4">
          {/* Cup Notes (항상 펼침) */}
          <section>
            <div style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}>
              <span className="w-full flex justify-between items-center py-4 px-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white group sm:py-2 sm:px-1 sm:text-base">컵노트</span>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              {/* Floral */}
              <div className="relative rounded-2xl overflow-hidden h-72 flex flex-col justify-between p-8 mb-8">
                <Image src="/images/Floral.jpg" alt="Floral" fill className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-2">플로럴</div>
                    <div className="text-lg text-white mb-6">"마치 꽃밭을 걷는 듯한 한잔"</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[ '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리' ].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`border px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-150
                          ${selectedNotes.includes(note)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-white text-white bg-transparent hover:bg-white/20'}
                        `}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Fruity */}
              <div className="relative rounded-2xl overflow-hidden h-72 flex flex-col justify-between p-8 mb-8">
                <Image src="/images/Fruity.jpg" alt="Fruity" fill className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-2">프루티</div>
                    <div className="text-lg text-white mb-6">"과일 한 조각을 머금은 듯한 상큼함"</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[ '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구' ].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`border px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-150
                          ${selectedNotes.includes(note)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-white text-white bg-transparent hover:bg-white/20'}
                        `}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Nutty */}
              <div className="relative rounded-2xl overflow-hidden h-72 flex flex-col justify-between p-8 mb-8">
                <Image src="/images/Nutty.jpg" alt="Nutty" fill className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-2">너티</div>
                    <div className="text-lg text-white mb-6">"고소하고 달콤한 너트의 풍미"</div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[ '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스' ].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`border px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-150
                          ${selectedNotes.includes(note)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-white text-white bg-transparent hover:bg-white/20'}
                        `}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Brew Method */}
          <section>
            <button
              className={`w-full flex justify-between items-center py-4 px-2 bg-transparent border-none rounded-none shadow-none transition-all text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none group sm:py-2 sm:px-1 sm:text-base`}
              style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}
            >
              <span>추출방식</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                <button
                  key={method}
                  onClick={() => toggleBrewMethod(method)}
                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                    selectedBrewMethods.includes(method)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </section>
          {/* Originnnnnnn */}
          <section>
            <button
              className={`w-full flex justify-between items-center py-4 px-2 bg-transparent border-none rounded-none shadow-none transition-all text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none group sm:py-2 sm:px-1 sm:text-base`}
              style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}
            >
              <span>원산지</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['에티오피아아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                <button
                  key={origin}
                  onClick={() => toggleOrigin(origin)}
                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                    selectedOrigins.includes(origin)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
              <span>가공방식</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                <button
                  key={process}
                  onClick={() => toggleProcess(process)}
                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                    selectedProcesses.includes(process)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
              <span>로스팅레벨</span>
            </button>
            <div className="flex flex-nowrap overflow-x-auto gap-2 px-2 pb-4 md:flex-wrap md:overflow-visible md:gap-1 md:px-1 md:pb-2">
              {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                <button
                  key={roast}
                  onClick={() => toggleRoast(roast)}
                  className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                    selectedRoast.includes(roast)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {roast}
                </button>
              ))}
            </div>
          </section>
        </div>
        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between backdrop-blur-md">
          <button onClick={onReset} className="px-5 py-2 bg-bluebottle-blue text-white font-medium rounded-lg border border-bluebottle-blue font-bluebottle hover:bg-[#004b82] transition">리셋</button>
          <button onClick={onApply} className="px-5 py-2 bg-bluebottle-blue text-white font-medium rounded-lg border border-bluebottle-blue font-bluebottle hover:bg-[#004b82] transition">적용</button>
        </div>
      </div>
    );
  }

  // 모바일 화면: mobileCombined가 true면 Cup Notes와 Coffee Filters를 나란히 보여줌
  if (typeof window !== 'undefined' && window.innerWidth < 768 && mobileCombined) {
    const HEADER_HEIGHT = 56 + 56; // 헤더+검색바 높이 예시
    const BUTTON_BAR_HEIGHT = 64; // 버튼 바 높이 예시
    const SCROLL_AREA_HEIGHT = `calc(100vh - ${HEADER_HEIGHT + BUTTON_BAR_HEIGHT}px)`;
    return (
      <div className={`w-full min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative`}>
        <div className="flex flex-row gap-2 px-2 pt-4">
          {/* Cup Notes (좌측) */}
          <div className="flex-1 min-w-0 space-y-6 overflow-y-auto pb-16" style={{ maxHeight: SCROLL_AREA_HEIGHT }}>
            {/* Floral */}
            <div className="bg-white rounded-xl border border-bluebottle-border p-6 mb-6 font-bluebottle">
              <div className="relative w-full h-16 flex items-end rounded-t-3xl overflow-hidden">
                <img src="/images/Floral.jpg" alt="Floral" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/60 via-white/10 to-yellow-200/60" />
                <span className="relative z-10 text-2xl font-extrabold text-white drop-shadow-lg p-6 pb-3">플로럴</span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-4 pt-4">
                {[ '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리' ].map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedNotes.includes(note)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
            {/* Fruity */}
            <div className="bg-white rounded-xl border border-bluebottle-border p-6 mb-6 font-bluebottle">
              <div className="relative w-full h-16 flex items-end rounded-t-3xl overflow-hidden">
                <img src="/images/Fruity.jpg" alt="Fruity" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 via-white/10 to-pink-400/60" />
                <span className="relative z-10 text-2xl font-extrabold text-white drop-shadow-lg p-6 pb-3">프루티</span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-4 pt-4">
                {[ '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구' ].map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedNotes.includes(note)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
            {/* Nutty */}
            <div className="bg-white rounded-xl border border-bluebottle-border p-6 mb-6 font-bluebottle">
              <div className="relative w-full h-16 flex items-end rounded-t-3xl overflow-hidden">
                <img src="/images/Nutty.jpg" alt="Nutty" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 via-white/10 to-amber-700/60" />
                <span className="relative z-10 text-2xl font-extrabold text-white drop-shadow-lg p-6 pb-3">너티</span>
              </div>
              <div className="flex flex-wrap gap-2 px-4 pb-4 pt-4">
                {[ '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스' ].map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedNotes.includes(note)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Coffee Filters (우측) */}
          <div className="flex-1 min-w-0 space-y-6 overflow-y-auto pb-16" style={{ maxHeight: SCROLL_AREA_HEIGHT }}>
            {/* Brew Method */}
            <section>
              <div className="mb-2 text-lg font-bold text-indigo-700 flex items-center gap-2">추출방식</div>
              <div className="flex gap-2 pb-4 flex-wrap">
                {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                  <button
                    key={method}
                    onClick={() => toggleBrewMethod(method)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedBrewMethods.includes(method)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </section>
            {/* Origin */}
            <section>
              <div className="mb-2 text-lg font-bold text-indigo-700 flex items-center gap-2">원산지</div>
              <div className="flex gap-2 pb-4 flex-wrap">
                {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                  <button
                    key={origin}
                    onClick={() => toggleOrigin(origin)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedOrigins.includes(origin)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </section>
            {/* Process */}
            <section>
              <div className="mb-2 text-lg font-bold text-indigo-700 flex items-center gap-2">가공방식</div>
              <div className="flex gap-2 pb-4 flex-wrap">
                {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                  <button
                    key={process}
                    onClick={() => toggleProcess(process)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedProcesses.includes(process)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {process}
                  </button>
                ))}
              </div>
            </section>
            {/* Roast Level */}
            <section>
              <div className="mb-2 text-lg font-bold text-indigo-700 flex items-center gap-2">로스팅레벨</div>
              <div className="flex gap-2 pb-4 flex-wrap">
                {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                  <button
                    key={roast}
                    onClick={() => toggleRoast(roast)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition-colors ${
                      selectedRoast.includes(roast)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {roast}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
        {/* 하단 고정 Reset/Apply 버튼 - flex-row 컨테이너 바깥에 위치 */}
        <div className="fixed bottom-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 border-t border-indigo-200 flex justify-between px-4 py-3 backdrop-blur-md z-50">
          <button onClick={onReset} className="px-5 py-2 bg-bluebottle-blue text-white font-medium rounded-lg border border-bluebottle-blue font-bluebottle hover:bg-[#004b82] transition">리셋</button>
          <button onClick={onApply} className="px-5 py-2 bg-bluebottle-blue text-white font-medium rounded-lg border border-bluebottle-blue font-bluebottle hover:bg-[#004b82] transition">적용</button>
        </div>
      </div>
    );
  }

  // 중복된 모바일 탭 UI return문 삭제 (아무것도 렌더링하지 않음)
  return null;
} 