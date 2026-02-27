import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const prisma = new PrismaClient();

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '';
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || '';
const KAKAO_REDIRECT_URI =
  process.env.KAKAO_REDIRECT_URI ||
  'https://cupnotescity.com/api/auth/kakao/callback';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

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
        console.warn('카카오 state 파싱 실패:', e);
      }
    }

    const tokenResponse = await fetch(
      'https://kauth.kakao.com/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: KAKAO_CLIENT_ID,
          client_secret: KAKAO_CLIENT_SECRET || '',
          code,
          redirect_uri: KAKAO_REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('카카오 토큰 요청 실패:', tokenData);
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=token_request_failed`
      );
    }

    const profileResponse = await fetch(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'Content-Type':
            'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const profileData = await profileResponse.json();
    if (!profileData.id) {
      console.error('카카오 프로필 요청 실패:', profileData);
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=profile_request_failed`
      );
    }

    const kakaoUserId = profileData.id.toString();
    const email = profileData.kakao_account?.email || null;
    const name = profileData.kakao_account?.profile?.nickname || null;

    if (!email) {
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=email_not_provided`
      );
    }

    if (targetRole === 'manager') {
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
          },
        });
      }

      const token = jwt.sign(
        {
          id: manager.id,
          email: manager.email,
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

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { providerId: kakaoUserId, provider: 'kakao' },
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
          provider: 'kakao',
          providerId: kakaoUserId,
          name,
        },
      });
    } else if (user.provider !== 'kakao' || !user.providerId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'kakao',
          providerId: kakaoUserId,
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
    console.error('카카오 콜백 오류:', error);
    return NextResponse.redirect(`${BASE_URL}/auth?error=auth_failed`);
  } finally {
    await prisma.$disconnect();
  }
}

