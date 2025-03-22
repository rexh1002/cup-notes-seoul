import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();
    console.log('역할 변경 시도:', { userId, role });

    // 유효한 역할인지 확인
    if (!['admin', 'manager', 'user'].includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      );
    }

    // 사용자 존재 여부 확인
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: '해당 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 역할 변경
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    console.log('역할 변경 성공:', updatedUser);

    return NextResponse.json(
      { success: true, message: '사용자 역할이 변경되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('역할 변경 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
