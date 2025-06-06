import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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

  // 모바일 여부 감지
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // PC(웹) 화면: 기존 FilterPanel 유지
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return (
      <div className={`fixed w-96 h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl overflow-y-auto z-50 ${className || ''}`}
        style={{ height: 'calc(100vh - 32px)' }}
      >
        <div className="p-6 space-y-4">
          {/* Cup Notes (항상 펼침) */}
          <section>
            <div style={{ borderBottom: '1.5px solid #e5e7eb', marginBottom: '0.5rem' }}>
              <span className="w-full flex justify-between items-center py-4 px-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white group sm:py-2 sm:px-1 sm:text-base">
                컵노트
                <button
                  onClick={onReset}
                  className="text-sm font-halis px-3 py-1 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  리셋
                </button>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              {/* Floral */}
              <div className="relative overflow-hidden h-[600px] flex flex-col justify-between p-8 mb-8">
                <Image src="/images/Floral.jpg" alt="Floral" fill className="absolute inset-0 w-full h-full object-cover" width={600} height={340} sizes="100vw" priority={false} unoptimized />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-2 font-chronicle">플로럴</div>
                    <div className="text-lg text-white mb-6 font-chronicle">마치 꽃밭을 걷는 듯한 한잔</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[ '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리' ].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                          ${selectedNotes.includes(note)
                            ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                            : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                        `}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Fruity */}
              <div className="relative overflow-hidden h-[600px] flex flex-col justify-between p-8 mb-8">
                <Image src="/images/Fruity.jpg" alt="Fruity" fill className="absolute inset-0 w-full h-full object-cover" width={600} height={340} sizes="100vw" priority={false} unoptimized />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-2 font-chronicle">프루티</div>
                    <div className="text-lg text-white mb-6 font-chronicle">과일 한 조각을 머금은 듯한 상큼함</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[ '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구' ].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                          ${selectedNotes.includes(note)
                            ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                            : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                        `}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Nutty */}
              <div className="relative overflow-hidden h-[600px] flex flex-col justify-between p-8 mb-8">
                <Image src="/images/Nutty.jpg" alt="Nutty" fill className="absolute inset-0 w-full h-full object-cover" width={600} height={340} sizes="100vw" priority={false} unoptimized />
                <div className="absolute inset-0 bg-black/45" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-2 font-chronicle">너티</div>
                    <div className="text-lg text-white mb-6 font-chronicle">고소하고 편안한 너트의 풍미</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[ '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스' ].map((note) => (
                      <button
                        key={note}
                        onClick={() => toggleNote(note)}
                        className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                          ${selectedNotes.includes(note)
                            ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                            : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
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
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedBrewMethods.includes(method)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
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
              {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                <button
                  key={origin}
                  onClick={() => toggleOrigin(origin)}
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedOrigins.includes(origin)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
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
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedProcesses.includes(process)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
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
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedRoast.includes(roast)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
                >
                  {roast}
                </button>
              ))}
            </div>
          </section>
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
      <div className={`w-full min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative pt-[64px] pb-16`}>
        <div className="flex flex-col gap-6">
          {/* 컵노트 섹션 */}
          <section>
            {/* 컵노트 서브제목 (모바일 전용) */}
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-0 pl-2 font-chronicle">컵노트</div>
            {/* Floral */}
            <div className="relative overflow-hidden h-[340px] flex flex-col justify-between p-4 mb-6">
              <Image src="/images/Floral.jpg" alt="Floral" className="absolute inset-0 w-full h-full object-cover" width={600} height={340} sizes="100vw" priority={false} unoptimized />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-white mb-2 font-chronicle">플로럴</div>
                  <div className="text-base text-white mb-4 font-chronicle">마치 꽃밭을 걷는 듯한 한잔</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[ '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리' ].map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                      ${selectedNotes.includes(note)
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                        : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                    `}
                  >
                    {note}
                  </button>
                ))}
                </div>
              </div>
            </div>
            {/* Fruity */}
            <div className="relative overflow-hidden h-[340px] flex flex-col justify-between p-4 mb-6">
              <Image src="/images/Fruity.jpg" alt="Fruity" className="absolute inset-0 w-full h-full object-cover" width={600} height={340} sizes="100vw" priority={false} unoptimized />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-white mb-2 font-chronicle">프루티</div>
                  <div className="text-base text-white mb-4 font-chronicle">과일 한 조각을 머금은 듯한 상큼함</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[ '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구' ].map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                      ${selectedNotes.includes(note)
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                        : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                    `}
                  >
                    {note}
                  </button>
                ))}
                </div>
              </div>
            </div>
            {/* Nutty */}
            <div className="relative overflow-hidden h-[340px] flex flex-col justify-between p-4 mb-6">
              <Image src="/images/Nutty.jpg" alt="Nutty" className="absolute inset-0 w-full h-full object-cover" width={600} height={340} sizes="100vw" priority={false} unoptimized />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-white mb-2 font-chronicle">너티</div>
                  <div className="text-base text-white mb-4 font-chronicle">고소하고 편안한 너트의 풍미</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[ '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스' ].map((note) => (
                  <button
                    key={note}
                    onClick={() => toggleNote(note)}
                    className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                      ${selectedNotes.includes(note)
                        ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                        : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                    `}
                  >
                    {note}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </section>
          {/* 추출방식/원산지/가공방식/로스팅레벨 섹션 */}
          <section>
            {/* Brew Method */}
            <div className="mb-2 text-lg font-bold flex items-center gap-2 px-4" style={{color: isMobile ? '#222' : ''}}>추출방식</div>
            <div className="flex gap-2 pb-4 flex-wrap px-4">
              {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                <button
                  key={method}
                  onClick={() => toggleBrewMethod(method)}
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedBrewMethods.includes(method)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
                >
                  {method}
                </button>
              ))}
            </div>
            {/* Origin */}
            <div className="mb-2 text-lg font-bold flex items-center gap-2 px-4" style={{color: isMobile ? '#222' : ''}}>원산지</div>
            <div className="flex gap-2 pb-4 flex-wrap px-4">
              {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                <button
                  key={origin}
                  onClick={() => toggleOrigin(origin)}
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedOrigins.includes(origin)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
                >
                  {origin}
                </button>
              ))}
            </div>
            {/* Process */}
            <div className="mb-2 text-lg font-bold flex items-center gap-2 px-4" style={{color: isMobile ? '#222' : ''}}>가공방식</div>
            <div className="flex gap-2 pb-4 flex-wrap px-4">
              {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                <button
                  key={process}
                  onClick={() => toggleProcess(process)}
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedProcesses.includes(process)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
                >
                  {process}
                </button>
              ))}
            </div>
            {/* Roast Level */}
            <div className="mb-2 text-lg font-bold flex items-center gap-2 px-4" style={{color: isMobile ? '#222' : ''}}>로스팅레벨</div>
            <div className="flex gap-2 pb-4 flex-wrap px-4">
              {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                <button
                  key={roast}
                  onClick={() => toggleRoast(roast)}
                  className={`px-2 py-1 text-sm font-halis border shadow transition active:scale-95
                    ${selectedRoast.includes(roast)
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : 'bg-white/80 text-black border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg'}
                  `}
                >
                  {roast}
                </button>
              ))}
            </div>
          </section>
        </div>
        {/* 하단 고정 Reset/Apply 버튼 - flex-row 컨테이너 바깥에 위치 */}
        <div className="fixed bottom-14 left-0 right-0 bg-white/95 dark:bg-gray-900/95 border-t border-indigo-200 flex justify-between px-4 py-3 backdrop-blur-md z-50">
          <button onClick={onReset} className="px-5 py-2 bg-bluebottle-blue text-white font-medium rounded-lg border border-bluebottle-blue font-bluebottle hover:bg-[#004b82] transition">리셋</button>
          <button onClick={onApply} className="px-5 py-2 bg-bluebottle-blue text-white font-medium rounded-lg border border-bluebottle-blue font-bluebottle hover:bg-[#004b82] transition">적용</button>
        </div>
      </div>
    );
  }

  // 중복된 모바일 탭 UI return문 삭제 (아무것도 렌더링하지 않음)
  return null;
} 