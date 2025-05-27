import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Filter, Map } from 'lucide-react';

export default function MobileNavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/filters', icon: Filter, label: '필터' },
    { href: '/map', icon: Map, label: '지도' },
  ];

  if (typeof window === 'undefined') return null;

  return createPortal(
    <nav className="fixed bottom-0 left-0 right-0 h-12 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-[99999] md:hidden">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive(href)
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>,
    document.body
  );
} 