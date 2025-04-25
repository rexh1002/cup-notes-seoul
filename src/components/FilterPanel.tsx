import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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

          <div className="p-6 space-y-8">
            {/* 추출방식 */}
            <section>
              <h3 className="text-sm font-medium mb-3">Brew Method</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
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
            </section>

            {/* My Cup Notes */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold">My Cup Notes</h3>
              <div className="grid grid-cols-1 gap-6">
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
                    <h4 className="text-xl font-light text-white mb-6">Floral</h4>
                    <div className="flex flex-wrap gap-2 content-start">
                      {['라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스'].map((note) => (
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
                    <h4 className="text-xl font-light text-white mb-6">Fruity</h4>
                    <div className="flex flex-wrap gap-2 content-start">
                      {['파인애플', '복숭아', '리치', '사과', '감귤', '배'].map((note) => (
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
                    <h4 className="text-xl font-light text-white mb-6">Nutty</h4>
                    <div className="flex flex-wrap gap-2 content-start">
                      {['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거'].map((note) => (
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
                  </div>
                </div>
              </div>
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