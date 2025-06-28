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

// GET 핸들러 추가 (라우트 인식 강제)
export async function GET() {
  console.log('[API] /api/user/delete GET 진입');
  return NextResponse.json({ status: 'ok' });
}

export async function DELETE(request: NextRequest) {
  console.log('[API] /api/user/delete DELETE 진입');
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('[API] No token provided');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyJwt(token, JWT_SECRET_KEY);
    if (!decoded) {
      console.log('[API] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const idFromToken = decoded.id;
    console.log('[API] idFromToken:', idFromToken);

    // 사용자 확인 (일반/소셜 모두 처리)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: idFromToken },
          { providerId: idFromToken }
        ]
      }
    });

    if (!user) {
      console.log('[API] User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userIdToDelete = user.id;
    console.log('[API] Deleting user:', userIdToDelete);

    // 관리자인 경우 카페도 함께 삭제
    if (user.role === 'manager' || user.role === 'cafeManager') {
      await prisma.cafe.deleteMany({
        where: { managerId: userIdToDelete },
      });
      console.log('[API] Deleted cafes for manager:', userIdToDelete);
    }

    // 사용자 삭제
    await prisma.user.delete({
      where: { id: userIdToDelete },
    });
    console.log('[API] User deleted:', userIdToDelete);

    return NextResponse.json({
      success: true,
      message: '회원탈퇴가 완료되었습니다.'
    });
  } catch (error) {
    console.error('[API] Error deleting user:', error);
    return NextResponse.json({
      error: '회원탈퇴 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 