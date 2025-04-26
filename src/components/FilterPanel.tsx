import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

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
          className="fixed left-0 top-0 bottom-0 w-96 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl z-50 overflow-y-auto"
        >
          <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 z-10 p-4 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold tracking-tight">Coffee Filters</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
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
              <button className={`w-full flex justify-between items-center px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-base transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 ${openSection === 'brew' ? 'ring-2 ring-blue-400' : ''}`} onClick={() => toggleSection('brew')}>
                <span>Brew Method</span>
                <motion.span animate={{ rotate: openSection === 'brew' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown size={22} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'brew' && (
                  <motion.div
                    key="brew"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 p-4">
                      {['핸드드립', '에스프레소', '콜드브루'].map((method) => (
                        <button
                          key={method}
                          onClick={() => toggleBrewMethod(method)}
                          className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${
                            selectedBrewMethods.includes(method)
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Origin */}
            <section>
              <button className={`w-full flex justify-between items-center px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-base transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 ${openSection === 'origin' ? 'ring-2 ring-blue-400' : ''}`} onClick={() => toggleSection('origin')}>
                <span>Origin</span>
                <motion.span animate={{ rotate: openSection === 'origin' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown size={22} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'origin' && (
                  <motion.div
                    key="origin"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 p-4">
                      {['에티오피아', '콜롬비아', '브라질', '과테말라', '케냐', '코스타리카', '파나마', '인도네시아', '르완다', '엘살바도르'].map((origin) => (
                        <button
                          key={origin}
                          onClick={() => toggleOrigin(origin)}
                          className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${
                            selectedOrigins.includes(origin)
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {origin}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Process */}
            <section>
              <button className={`w-full flex justify-between items-center px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-base transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 ${openSection === 'process' ? 'ring-2 ring-blue-400' : ''}`} onClick={() => toggleSection('process')}>
                <span>Process</span>
                <motion.span animate={{ rotate: openSection === 'process' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown size={22} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'process' && (
                  <motion.div
                    key="process"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 p-4">
                      {['워시드', '내추럴', '허니', '무산소 발효', '디카페인'].map((process) => (
                        <button
                          key={process}
                          onClick={() => toggleProcess(process)}
                          className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${
                            selectedProcesses.includes(process)
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {process}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Roast Level */}
            <section>
              <button className={`w-full flex justify-between items-center px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold text-base transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 ${openSection === 'roast' ? 'ring-2 ring-blue-400' : ''}`} onClick={() => toggleSection('roast')}>
                <span>Roast Level</span>
                <motion.span animate={{ rotate: openSection === 'roast' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown size={22} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'roast' && (
                  <motion.div
                    key="roast"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 p-4">
                      {['라이트', '미디엄라이트', '미디엄', '미디엄다크', '다크'].map((roast) => (
                        <button
                          key={roast}
                          onClick={() => toggleRoast(roast)}
                          className={`text-sm px-4 py-2 rounded-full shadow transition-all font-medium ${
                            selectedRoast.includes(roast)
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {roast}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* My Cup Notes */}
            <section>
              <button className={`w-full flex justify-between items-center px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-lg transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 ${openSection === 'notes' ? 'ring-2 ring-purple-400' : ''}`} onClick={() => toggleSection('notes')}>
                <span>My Cup Notes</span>
                <motion.span animate={{ rotate: openSection === 'notes' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown size={22} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-4 mt-2">
                      {/* Floral */}
                      <div className="rounded-xl shadow bg-white/80 dark:bg-gray-800">
                        <button
                          className="relative w-full h-16 flex items-center rounded-xl overflow-hidden group focus:outline-none"
                          onClick={() => setOpenFloral((v) => !v)}
                        >
                          <Image
                            src="/images/Floral.jpg"
                            alt="Floral"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ zIndex: 1 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/60 via-white/10 to-yellow-200/60 group-hover:bg-pink-300/70 transition-colors duration-300" style={{ zIndex: 2 }} />
                          <span className="relative z-10 text-xl font-bold text-white drop-shadow-lg pl-6">Floral</span>
                          <motion.span
                            className="relative z-10 ml-auto pr-6 text-white"
                            animate={{ rotate: openFloral ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown size={24} />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openFloral && (
                            <motion.div
                              key="floral"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 content-start px-4 pb-4 pt-2">
                                {[
                                  '라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차', '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리'
                                ].map((note) => (
                                  <button
                                    key={note}
                                    onClick={() => toggleNote(note)}
                                    className={`text-sm px-4 py-2 rounded-full shadow transition-colors font-medium ${
                                      selectedNotes.includes(note)
                                        ? 'bg-gradient-to-r from-pink-400 to-yellow-300 text-gray-900 shadow-lg scale-105'
                                        : 'bg-white/80 text-gray-900 hover:bg-pink-50 hover:scale-105'
                                    }`}
                                  >
                                    {note}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Fruity */}
                      <div className="rounded-xl shadow bg-white/80 dark:bg-gray-800">
                        <button
                          className="relative w-full h-16 flex items-center rounded-xl overflow-hidden group focus:outline-none"
                          onClick={() => setOpenFruity((v) => !v)}
                        >
                          <Image
                            src="/images/Fruity.jpg"
                            alt="Fruity"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ zIndex: 1 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 via-white/10 to-pink-400/60 group-hover:bg-yellow-300/70 transition-colors duration-300" style={{ zIndex: 2 }} />
                          <span className="relative z-10 text-xl font-bold text-white drop-shadow-lg pl-6">Fruity</span>
                          <motion.span
                            className="relative z-10 ml-auto pr-6 text-white"
                            animate={{ rotate: openFruity ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown size={24} />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openFruity && (
                            <motion.div
                              key="fruity"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 content-start px-4 pb-4 pt-2">
                                {[
                                  '파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리', '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구'
                                ].map((note) => (
                                  <button
                                    key={note}
                                    onClick={() => toggleNote(note)}
                                    className={`text-sm px-4 py-2 rounded-full shadow transition-colors font-medium ${
                                      selectedNotes.includes(note)
                                        ? 'bg-gradient-to-r from-yellow-300 to-pink-400 text-gray-900 shadow-lg scale-105'
                                        : 'bg-white/80 text-gray-900 hover:bg-yellow-50 hover:scale-105'
                                    }`}
                                  >
                                    {note}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {/* Nutty */}
                      <div className="rounded-xl shadow bg-white/80 dark:bg-gray-800">
                        <button
                          className="relative w-full h-16 flex items-center rounded-xl overflow-hidden group focus:outline-none"
                          onClick={() => setOpenNutty((v) => !v)}
                        >
                          <Image
                            src="/images/Nutty.jpg"
                            alt="Nutty"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ zIndex: 1 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/60 via-white/10 to-amber-700/60 group-hover:bg-yellow-300/70 transition-colors duration-300" style={{ zIndex: 2 }} />
                          <span className="relative z-10 text-xl font-bold text-white drop-shadow-lg pl-6">Nutty</span>
                          <motion.span
                            className="relative z-10 ml-auto pr-6 text-white"
                            animate={{ rotate: openNutty ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown size={24} />
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {openNutty && (
                            <motion.div
                              key="nutty"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 content-start px-4 pb-4 pt-2">
                                {[
                                  '초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두', '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스'
                                ].map((note) => (
                                  <button
                                    key={note}
                                    onClick={() => toggleNote(note)}
                                    className={`text-sm px-4 py-2 rounded-full shadow transition-colors font-medium ${
                                      selectedNotes.includes(note)
                                        ? 'bg-gradient-to-r from-yellow-400 to-amber-700 text-gray-900 shadow-lg scale-105'
                                        : 'bg-white/80 text-gray-900 hover:bg-yellow-50 hover:scale-105'
                                    }`}
                                  >
                                    {note}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 p-4 flex justify-between backdrop-blur-md">
            <button
              onClick={onReset}
              className="px-6 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Reset
            </button>
            <button
              onClick={onApply}
              className="px-6 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Apply
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 