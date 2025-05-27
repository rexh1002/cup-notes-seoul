import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, User } from 'lucide-react';

export default function MobileNavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', icon: Home, label: '홈' },
    { href: '/map', icon: Map, label: '지도' },
    { href: '/mypage', icon: User, label: '마이페이지' },
  ];

  if (typeof window === 'undefined') return null;

  return createPortal(
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-[99999] md:hidden">
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
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>,
    document.body
  );
} 