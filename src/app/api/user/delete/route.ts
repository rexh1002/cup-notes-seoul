import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export const dynamic = 'force-dynamic';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function verifyJwt(token: string, secret: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyJwt(token, JWT_SECRET_KEY);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const idFromToken = decoded.id;

    // 사용자 확인 (일반/소셜 모두 처리)
    let user = await prisma.user.findUnique({
      where: { id: idFromToken },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { providerId: idFromToken },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userIdToDelete = user.id;

    // 관리자인 경우 카페도 함께 삭제
    if (user.role === 'manager' || user.role === 'cafeManager') {
      await prisma.cafe.deleteMany({
        where: { managerId: userIdToDelete },
      });
    }

    // 사용자 삭제
    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    return NextResponse.json({
      success: true,
      message: '회원탈퇴가 완료되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      error: '회원탈퇴 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 