import Link from 'next/link';
import { Filter, Map as MapIcon, User } from 'lucide-react';

export default function MobileNavBar({ current }: { current: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-white border-t border-gray-200 flex justify-around items-center h-14 md:hidden shadow-xl">
      <Link href="/filters" className={`flex flex-col items-center gap-0.5 text-xs font-semibold ${current === 'filters' ? 'text-blue-600' : 'text-gray-500'}`}> <Filter className="w-6 h-6 mb-0.5" /> Filters </Link>
      <Link href="/map" className={`flex flex-col items-center gap-0.5 text-xs font-semibold ${current === 'map' ? 'text-blue-600' : 'text-gray-500'}`}> <MapIcon className="w-6 h-6 mb-0.5" /> Map </Link>
      <Link href="/auth" className={`flex flex-col items-center gap-0.5 text-xs font-semibold ${current === 'auth' ? 'text-blue-600' : 'text-gray-500'}`}> <User className="w-6 h-6 mb-0.5" /> Auth </Link>
    </nav>
  );
} 