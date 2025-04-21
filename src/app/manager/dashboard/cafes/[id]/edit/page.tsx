import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import EditCafeClient from './edit-client';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export default async function EditCafePage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const authToken = cookieStore.get('authToken')?.value;

  if (!authToken) {
    redirect('/auth/login');
  }

  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(authToken, JWT_SECRET_KEY) as { id: string; role: string };
    
    // 카페 정보 조회
    const cafe = await prisma.cafe.findUnique({
      where: {
        id: params.id,
        ...(decoded.role === 'cafeManager' ? { managerId: decoded.id } : {}),
      },
      include: {
        coffees: true,
      },
    });

    if (!cafe) {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600">요청하신 카페 정보를 찾을 수 없습니다.</p>
          </div>
      </div>
    );
  }

    return <EditCafeClient cafe={cafe} />;
  } catch (error) {
    console.error('카페 정보 조회 실패:', error);
    redirect('/auth/login');
  }
}
