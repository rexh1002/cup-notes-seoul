'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Coffee, MapPin, Phone, Home } from 'lucide-react';

// 타입 정의
interface CafeInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  coffeeCount: number;
  createdAt: string;
  updatedAt: string;
}

// Card 및 Button 컴포넌트 정의 - 기존 shadcn/ui 컴포넌트 대신 직접 구현
interface ComponentProps {
  children: React.ReactNode;
  className?: string;
}

// Card 컴포넌트
const Card = ({ children, className = "" }: ComponentProps) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

// CardContent 컴포넌트
const CardContent = ({ children, className = "" }: ComponentProps) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Button 컴포넌트
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = "", 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-8"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cafes, setCafes] = useState<CafeInfo[]>([]);

  // 개발 모드 감지
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const fetchMyCafes = async () => {
      try {
        setIsLoading(true);
        
        // 토큰 확인
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // 실제 API 호출
        console.log('API 호출 시작, 토큰 확인:', token.substring(0, 10) + '...');
        
        const response = await fetch('/api/manager/cafes', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 응답 에러:', response.status, errorText);
          throw new Error(`카페 정보를 불러오는데 실패했습니다. 상태 코드: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API 응답 데이터:', data);
        
        if (data.cafes) {
          setCafes(data.cafes);
          console.log('카페 개수:', data.cafes.length);
        } else {
          console.error('cafes 데이터가 없습니다:', data);
          setError('서버에서 올바른 데이터 형식이 반환되지 않았습니다.');
        }
        
      } catch (err) {
        console.error('API 호출 오류:', err);
        setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMyCafes();
  }, [router]);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/')}>홈으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">내 카페 관리</h1>
        <div className="flex items-center gap-3">
          {/* 메인페이지로 가기 버튼 추가 */}
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              메인페이지로 가기
            </Button>
          </Link>
          <Link href="/manager/dashboard/cafes/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              새 카페 등록
            </Button>
          </Link>
        </div>
      </div>
      
      {cafes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">등록된 카페가 없습니다.</p>
          <Link href="/manager/dashboard/cafes/new">
            <Button>첫 카페 등록하기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafes.map((cafe) => (
            <Card key={cafe.id}>
              <CardContent>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{cafe.name}</h2>
                  <Link href={`/manager/dashboard/cafes/${cafe.id}/edit`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      수정
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{cafe.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{cafe.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4" />
                    <span>등록된 원두: {cafe.coffeeCount}개</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <p>등록일: {new Date(cafe.createdAt).toLocaleDateString()}</p>
                  <p>최종 수정일: {new Date(cafe.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}