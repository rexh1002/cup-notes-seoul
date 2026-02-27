import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

// Prisma 클라이언트 싱글톤으로 관리
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const REDIRECT_URI = `${BASE_URL}/api/auth/naver/callback`;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/auth?error=no_code`);
    }

    let targetRole: 'user' | 'manager' = 'user';
    if (state) {
      try {
        const decoded = JSON.parse(
          Buffer.from(state, 'base64url').toString('utf8')
        );
        if (decoded.role === 'manager') targetRole = 'manager';
      } catch (e) {
        console.warn('네이버 state 파싱 실패:', e);
      }
    }

    const tokenResponse = await fetch(
      'https://nid.naver.com/oauth2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: NAVER_CLIENT_ID,
          client_secret: NAVER_CLIENT_SECRET,
          code,
          state: state || '',
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('네이버 토큰 요청 실패:', tokenData);
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=token_request_failed`
      );
    }

    const profileResponse = await fetch(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const profileData = await profileResponse.json();
    if (profileData.resultcode !== '00') {
      console.error('네이버 프로필 요청 실패:', profileData);
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=profile_request_failed`
      );
    }

    const responseData = profileData.response;
    if (!responseData) {
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=profile_request_failed`
      );
    }

    const naverUserId = responseData.id;
    const email =
      responseData.email ||
      (responseData.id ? `${responseData.id}@naver.com` : null);
    const name = responseData.name || null;

    if (!email) {
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=email_required`
      );
    }

    if (targetRole === 'manager') {
      // 카페 매니저 소셜 가입/로그인
      let manager = await prisma.manager.findUnique({
        where: { email },
      });

      if (!manager) {
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        manager = await prisma.manager.create({
          data: {
            email,
            password: hashedPassword,
            // DB role은 기본값(cafeManager)을 사용
          },
        });
      }

      const token = jwt.sign(
        {
          id: manager.id,
          email: manager.email,
          // 토큰의 role은 manager로 통일 (매니저 전용 API들이 기대하는 값)
          role: 'manager',
        },
        JWT_SECRET_KEY,
        { expiresIn: '7d' }
      );

      const response = NextResponse.redirect(`${BASE_URL}/?token=${token}`);
      response.cookies.set({
        name: 'authToken',
        value: token,
        maxAge: 7 * 24 * 60 * 60,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return response;
    }

    // 일반 사용자 소셜 가입/로그인
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { provider: 'naver', providerId: naverUserId },
        ],
      },
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'user',
          provider: 'naver',
          providerId: naverUserId,
          name,
        },
      });
    } else if (user.provider !== 'naver' || !user.providerId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'naver',
          providerId: naverUserId,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    const response = NextResponse.redirect(`${BASE_URL}/?token=${token}`);
    response.cookies.set({
      name: 'authToken',
      value: token,
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('네이버 콜백 오류 발생:', error);
    return NextResponse.redirect(`${BASE_URL}/auth?error=auth_failed`);
  } finally {
    await prisma.$disconnect();
  }
}

