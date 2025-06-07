'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Edit, Coffee, MapPin, Phone, Home, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';

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

// 카페 카드 컴포넌트
const CafeCard = React.memo(function CafeCard({ cafe, onDelete }: { cafe: CafeInfo; onDelete: (id: string) => void }) {
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('인증 정보가 없습니다.');
        return;
      }

      const response = await fetch(`/api/manager/cafes/${cafe.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '카페 삭제에 실패했습니다.');
      }

      toast.success('카페가 성공적으로 삭제되었습니다.');
      onDelete(cafe.id);
    } catch (err) {
      console.error('카페 삭제 오류:', err);
      toast.error(err instanceof Error ? err.message : '카페 삭제에 실패했습니다.');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{cafe.name}</h2>
          <div className="flex items-center gap-2">
            <Link href={`/manager/dashboard/cafes/${cafe.id}/edit`} passHref>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit className="w-4 h-4" />
                수정
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>카페 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    정말로 &ldquo;{cafe.name}&rdquo;을(를) 삭제하시겠습니까?
                    <br />
                    이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    삭제하기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
  );
});

export default function DashboardClient() {
  const router = useRouter();
  const [cafes, setCafes] = useState<CafeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCafes = useCallback(async () => {
    console.log('[대시보드] 카페 목록 조회 시작');
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('[대시보드] 인증 토큰 없음');
        router.push('/auth/login');
        return;
      }

      console.log('[대시보드] API 요청 시작');
      const response = await fetch('/api/manager/cafes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      console.log('[대시보드] API 응답 상태:', response.status);
      const data = await response.json();
      console.log('[대시보드] API 응답 데이터:', data);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('[대시보드] 인증 만료');
          localStorage.removeItem('authToken');
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || '카페 정보를 불러오는데 실패했습니다.');
      }

      if (!data.success) {
        throw new Error(data.error || '카페 정보를 불러오는데 실패했습니다.');
      }

      console.log(`[대시보드] 카페 목록 로드 성공: ${data.cafes?.length}개의 카페`);
      setCafes(data.cafes || []);
    } catch (err) {
      console.error('[대시보드] 카페 목록 로딩 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '카페 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[대시보드] 카페 목록 조회 완료');
    }
  }, [router]);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  const handleCafeDelete = useCallback((deletedId: string) => {
    setCafes(prevCafes => prevCafes.filter(cafe => cafe.id !== deletedId));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-32 h-32" />
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold flex flex-row md:block">내 카페 관리</h1>
        <div className="flex items-center gap-3">
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
            <CafeCard key={cafe.id} cafe={cafe} onDelete={handleCafeDelete} />
          ))}
        </div>
      )}
    </div>
  );
} 