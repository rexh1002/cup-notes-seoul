import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';
const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 일반 사용자, 매니저, 소셜 로그인 사용자 모두 확인
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const manager = await prisma.manager.findUnique({
      where: { email },
    });

    // 해당 이메일로 등록된 계정이 없는 경우
    if (!user && !manager) {
      console.log(`No account found for email: ${email}`);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    let accountType;
    let account;
    let role;

    if (user) {
      accountType = 'user';
      account = user;
      role = user.role || 'user';
    } else {
      accountType = 'manager';
      account = manager;
      role = 'manager';
    }

    // User 모델에 provider 필드가 있는지 타입 안전하게 확인
    // @ts-ignore를 사용하거나 as any로 타입 캐스팅하여 타입스크립트 오류 방지
    const userProvider = (account as any).provider;
    
    // 소셜 로그인 계정인지 확인
    const isSocialAccount = userProvider ? true : false;
    
    if (isSocialAccount) {
      console.log(`${email} is a social login account (${userProvider}). Please use social login.`);
      return NextResponse.json(
        { 
          error: '이 이메일은 소셜 로그인으로 가입된 계정입니다. 해당 소셜 로그인을 이용해주세요.',
          provider: userProvider 
        },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, account!.password);
    if (!passwordMatch) {
      console.log(`Incorrect password for email: ${email}`);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const tokenData = {
      id: account!.id,
      email: account!.email,
      role: role,
    };

    const token = jwt.sign(tokenData, JWT_SECRET_KEY, {
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    console.log('로그인 성공:', {
      accountType,
      id: account!.id,
      email: account!.email,
      role,
    });

    // 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: account!.id,
          email: account!.email,
          role: role,
        },
      },
      { status: 200 }
    );

    // authToken을 쿠키에 저장
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1일
    });

    return response;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}