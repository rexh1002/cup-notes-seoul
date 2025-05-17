import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Filter, Map } from 'lucide-react';

export default function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-[160] md:hidden">
      <div className="max-w-screen-xl mx-auto px-4 h-full">
        <div className="flex justify-around items-center h-full">
          <Link
            href="/filters"
            className={`flex flex-col items-center justify-center w-20 h-full transition-all duration-200 ${
              pathname === '/filters'
                ? 'text-blue-600 scale-110'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <Filter className={`w-6 h-6 transition-transform duration-200 ${pathname === '/filters' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium mt-0.5">필터</span>
          </Link>

          <Link
            href="/map"
            className={`flex flex-col items-center justify-center w-20 h-full transition-all duration-200 ${
              pathname === '/map'
                ? 'text-blue-600 scale-110'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            <Map className={`w-6 h-6 transition-transform duration-200 ${pathname === '/map' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium mt-0.5">지도</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 