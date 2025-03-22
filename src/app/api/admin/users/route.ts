import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export async function GET() {
  try {
    // 모든 사용자 목록 가져오기
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true, // 역할 정보 포함
      },
      orderBy: { createdAt: 'desc' }, // 최신순 정렬
    });

    console.log('Fetched users:', users);
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('사용자 목록 조회 실패:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
