import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, provider, providerId } = await request.json();
    console.log('회원가입 시도:', email, provider ? `(${provider})` : '');

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 소셜 로그인 또는 일반 회원가입 처리
    let hashedPassword = '';
    
    if (provider) {
      // 소셜 로그인의 경우 랜덤 비밀번호 생성 (실제로는 사용되지 않음)
      hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 12);
    } else {
      // 일반 회원가입 - 비밀번호 유효성 검사
      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
          { status: 400 }
        );
      }
      // 비밀번호 암호화
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'user',
        provider: provider || null,
        providerId: providerId || null,
      },
    });

    console.log('회원가입 성공:', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      provider: newUser.provider
    });

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}