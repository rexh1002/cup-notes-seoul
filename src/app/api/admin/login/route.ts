import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';
console.log('JWT_SECRET_KEY:', JWT_SECRET_KEY);
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log(`Login attempt for email: ${email}`); // 디버깅용 콘솔 로그

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 관리자 계정 검색
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log(`Admin not found for email: ${email}`); // 디버깅 로그
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      console.log('비밀번호 불일치:', email);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const tokenData = {
      id: admin.id,
      email: admin.email,
      role: 'admin',
    };

    const token = jwt.sign(tokenData, JWT_SECRET_KEY, {
      expiresIn: '1d',
      algorithm: 'HS256',
    });

    console.log('로그인 성공:', {
      adminId: admin.id,
      email: admin.email,
    });

    // 응답 생성
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: admin.id,
          email: admin.email,
          role: 'admin',
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
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
