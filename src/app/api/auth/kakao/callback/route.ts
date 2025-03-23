import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '';
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || '';
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || 'https://www.cupnotescity.com/api/auth/kakao/callback';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cupnotescity.com';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=no_code`);
    }

    // 카카오에 토큰 요청
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET || '',
        code,
        redirect_uri: KAKAO_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('카카오 토큰 요청 실패:', tokenData);
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=token_request_failed`);
    }

    // 카카오 사용자 정보 요청
    const profileResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const profileData = await profileResponse.json();
    
    if (!profileData.id) {
      console.error('카카오 프로필 요청 실패:', profileData);
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=profile_request_failed`);
    }

    const kakaoUserId = profileData.id.toString();
    const email = profileData.kakao_account?.email;
    const name = profileData.kakao_account?.profile?.nickname || null;

    if (!email) {
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=email_not_provided`);
    }

    // 사용자 찾기 또는 생성
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { providerId: kakaoUserId, provider: 'kakao' }
        ]
      }
    });

    if (!user) {
      // 새 사용자 생성
      user = await prisma.user.create({
        data: {
          email,
          password: Math.random().toString(36).slice(-10), // 임의의 값
          role: 'user',
          provider: 'kakao',
          providerId: kakaoUserId,
          name
        }
      });
    } else if (user.provider !== 'kakao') {
      // 기존 이메일로 가입한 사용자가 카카오 연동을 시도하는 경우
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'kakao',
          providerId: kakaoUserId
        }
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    // 쿠키에 토큰 설정 및 토큰을 URL 파라미터로 전달
    const response = NextResponse.redirect(`${BASE_URL}/?token=${token}`);
    response.cookies.set({
      name: 'authToken',
      value: token,
      maxAge: 7 * 24 * 60 * 60, // 7일
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('카카오 콜백 오류:', error);
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=auth_failed`);
  }
}