// components/ui/divider.tsx
import React from 'react';
import { cn } from '../../lib/utils'; // cn 유틸함수가 없는 경우 별도 구현 필요

interface DividerProps {
  className?: string;
  children?: React.ReactNode;
}

export const Divider = ({ className, children }: DividerProps) => {
  if (children) {
    return (
      <div className={cn("relative my-6", className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-white text-sm text-gray-500">{children}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("w-full border-t border-gray-300 my-4", className)} />
  );
};

export default Divider;