import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export default function FilterPanel({
  isOpen,
  onClose,
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
  onApply
}: FilterPanelProps) {
  // 아코디언 상태 관리
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openFloral, setOpenFloral] = useState(false);
  const [openFruity, setOpenFruity] = useState(false);
  const [openNutty, setOpenNutty] = useState(false);
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -384 }}
          animate={{ x: 0 }}
          exit={{ x: -384 }}
          className="fixed left-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto"
        >
          <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Coffee Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Brew Method */}
            <section>
              <button className="w-full flex justify-between items-center mb-1 text-sm font-medium" onClick={() => toggleSection('brew')}>
                Brew Method
                <span>{openSection === 'brew' ? '▲' : '▼'}</span>
              </button>
              {openSection === 'brew' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-2">
                  <div className="flex flex-wrap gap-2">
                    {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                      <button
                        key={method}
                        onClick={() => toggleBrewMethod(method)}
                        className={`text-sm px-4 py-2 rounded-full transition-all ${
                          selectedBrewMethods.includes(method)
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Origin */}
            <section>
              <button className="w-full flex justify-between items-center mb-1 text-sm font-medium" onClick={() => toggleSection('origin')}>
                Origin
                <span>{openSection === 'origin' ? '▲' : '▼'}</span>
              </button>
              {openSection === 'origin' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-2">
                  <div className="flex flex-wrap gap-2">
                    {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                      <button
                        key={origin}
                        onClick={() => toggleOrigin(origin)}
                        className={`text-sm px-4 py-2 rounded-full transition-all ${
                          selectedOrigins.includes(origin)
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {origin}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Process */}
            <section>
              <button className="w-full flex justify-between items-center mb-1 text-sm font-medium" onClick={() => toggleSection('process')}>
                Process
                <span>{openSection === 'process' ? '▲' : '▼'}</span>
              </button>
              {openSection === 'process' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-2">
                  <div className="flex flex-wrap gap-2">
                    {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                      <button
                        key={process}
                        onClick={() => toggleProcess(process)}
                        className={`text-sm px-4 py-2 rounded-full transition-all ${
                          selectedProcesses.includes(process)
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {process}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Roast Level */}
            <section>
              <button className="w-full flex justify-between items-center mb-1 text-sm font-medium" onClick={() => toggleSection('roast')}>
                Roast Level
                <span>{openSection === 'roast' ? '▲' : '▼'}</span>
              </button>
              {openSection === 'roast' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl mb-2">
                  <div className="flex flex-wrap gap-2">
                    {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                      <button
                        key={roast}
                        onClick={() => toggleRoast(roast)}
                        className={`text-sm px-4 py-2 rounded-full transition-all ${
                          selectedRoast.includes(roast)
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {roast}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* My Cup Notes */}
            <section>
              <button className="w-full flex justify-between items-center mb-1 text-xl font-bold" onClick={() => toggleSection('notes')}>
                My Cup Notes
                <span>{openSection === 'notes' ? '▲' : '▼'}</span>
              </button>
              {openSection === 'notes' && (
                <div className="grid grid-cols-1 gap-6 mt-2">
                  {/* Floral Section */}
                  <div className="relative h-[300px] overflow-hidden group rounded-xl">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/Floral.jpg"
                        alt="Floral background"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col">
                      <button className="text-xl font-light text-white mb-6 flex justify-between items-center" onClick={() => setOpenFloral((v) => !v)}>
                        Floral <span>{openFloral ? '▲' : '▼'}</span>
                      </button>
                      {openFloral && (
                        <div className="flex flex-wrap gap-2 content-start">
                          {[
                            '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'
                          ].map((note) => (
                            <button
                              key={note}
                              onClick={() => toggleNote(note)}
                              className={`text-sm px-4 py-2 rounded-full transition-colors ${
                                selectedNotes.includes(note)
                                  ? 'bg-white text-gray-900'
                                  : 'bg-black/40 text-white hover:bg-white hover:text-gray-900'
                              }`}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fruity Section */}
                  <div className="relative h-[300px] overflow-hidden group rounded-xl">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/Fruity.jpg"
                        alt="Fruity background"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col">
                      <button className="text-xl font-light text-white mb-6 flex justify-between items-center" onClick={() => setOpenFruity((v) => !v)}>
                        Fruity <span>{openFruity ? '▲' : '▼'}</span>
                      </button>
                      {openFruity && (
                        <div className="flex flex-wrap gap-2 content-start">
                          {[
                            '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'
                          ].map((note) => (
                            <button
                              key={note}
                              onClick={() => toggleNote(note)}
                              className={`text-sm px-4 py-2 rounded-full transition-colors ${
                                selectedNotes.includes(note)
                                  ? 'bg-white text-gray-900'
                                  : 'bg-black/40 text-white hover:bg-white hover:text-gray-900'
                              }`}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nutty Section */}
                  <div className="relative h-[300px] overflow-hidden group rounded-xl">
                    <div className="absolute inset-0">
                      <Image
                        src="/images/Nutty.jpg"
                        alt="Nutty background"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <div className="absolute inset-0 p-6 flex flex-col">
                      <button className="text-xl font-light text-white mb-6 flex justify-between items-center" onClick={() => setOpenNutty((v) => !v)}>
                        Nutty <span>{openNutty ? '▲' : '▼'}</span>
                      </button>
                      {openNutty && (
                        <div className="flex flex-wrap gap-2 content-start">
                          {[
                            '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스'
                          ].map((note) => (
                            <button
                              key={note}
                              onClick={() => toggleNote(note)}
                              className={`text-sm px-4 py-2 rounded-full transition-colors ${
                                selectedNotes.includes(note)
                                  ? 'bg-white text-gray-900'
                                  : 'bg-black/40 text-white hover:bg-white hover:text-gray-900'
                              }`}
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between">
            <button
              onClick={onReset}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onApply}
              className="px-6 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 