// src/app/api/user/info/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export async function GET(request: Request) {
  try {
    // JWT 토큰 확인
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
    
    // 사용자 정보 조회
    let userData;
    if (decoded.role === 'user') {
      userData = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true }
      });
    } else if (decoded.role === 'manager') {
      userData = await prisma.manager.findUnique({
        where: { id: decoded.id },
        // Manager 모델에서는 name 필드가 없으므로 제거
        select: { id: true, email: true, role: true }
      });
    }
    
    if (!userData) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}