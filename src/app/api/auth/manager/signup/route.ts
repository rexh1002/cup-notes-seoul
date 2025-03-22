import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, cafeName, cafeAddress, cafePhone } = await request.json();
    console.log('카페 매니저 회원가입 시도:', { email, cafeName });

    // 이메일 중복 확인
    const existingManager = await prisma.manager.findUnique({
      where: { email },
    });

    if (existingManager) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 카페명 중복 확인
    const existingCafe = await prisma.cafe.findFirst({
      where: { name: cafeName },
    });

    if (existingCafe) {
      return NextResponse.json(
        { error: '이미 등록된 카페명입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 트랜잭션으로 매니저와 카페 동시 생성
    const result = await prisma.$transaction(async (prisma) => {
      // 매니저 생성
      const newManager = await prisma.manager.create({
        data: {
          email,
          password: hashedPassword,
          role: 'cafeManager',
        },
      });

      // 카페 생성 및 매니저와 연결
      const newCafe = await prisma.cafe.create({
        data: {
          name: cafeName,
          address: cafeAddress,
          phone: cafePhone,
          managerId: newManager.id,
          businessHours: [], // 빈 배열로 초기화
          snsLinks: [], // 빈 배열로 초기화
        },
      });

      return { manager: newManager, cafe: newCafe };
    });

    console.log('카페 매니저 회원가입 성공:', {
      managerId: result.manager.id,
      email: result.manager.email,
      cafeName: result.cafe.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          manager: {
            id: result.manager.id,
            email: result.manager.email,
            role: result.manager.role,
          },
          cafe: {
            id: result.cafe.id,
            name: result.cafe.name,
            address: result.cafe.address,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('카페 매니저 회원가입 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}