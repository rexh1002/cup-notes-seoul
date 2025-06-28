import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export const dynamic = 'force-dynamic';

function verifyJwt(token: string, secret: string): any {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('[API] JWT verification failed:', error);
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  console.log('[API] /api/manager/delete DELETE 진입');
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

    // 매니저 확인
    const manager = await prisma.manager.findUnique({ where: { id: idFromToken } });
    if (!manager) {
      console.log('[API] Manager not found');
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    // 관련 카페 삭제
    await prisma.cafe.deleteMany({ where: { managerId: idFromToken } });
    console.log('[API] Deleted cafes for manager:', idFromToken);

    // 매니저 삭제
    await prisma.manager.delete({ where: { id: idFromToken } });
    console.log('[API] Manager deleted:', idFromToken);

    return NextResponse.json({
      success: true,
      message: '매니저 탈퇴가 완료되었습니다.'
    });
  } catch (error) {
    console.error('[API] Error deleting manager:', error);
    return NextResponse.json({
      error: '매니저 탈퇴 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 