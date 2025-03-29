import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const NAVER_REDIRECT_URI = `${BASE_URL}/api/auth/naver/callback`;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export async function GET(request: Request) {
  try {
    console.log('네이버 콜백 시작');
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    console.log('네이버 콜백 파라미터:', { code: code?.substring(0, 10) + '...', state });
    
    if (!code) {
      console.error('코드 파라미터가 없습니다');
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=no_code`);
    }

    // 네이버에 토큰 요청
    console.log('네이버 토큰 요청 시작');
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code,
        state: state || '',
        redirect_uri: NAVER_REDIRECT_URI
      })
    });

    console.log('네이버 토큰 응답 상태:', tokenResponse.status);
    const tokenData = await tokenResponse.json();
    
    console.log('토큰 데이터 키:', Object.keys(tokenData));
    
    if (!tokenData.access_token) {
      console.error('네이버 토큰 요청 실패:', tokenData);
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=token_request_failed`);
    }

    console.log('액세스 토큰 획득 성공');

    // 네이버 사용자 정보 요청
    console.log('사용자 프로필 요청 시작');
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    console.log('프로필 응답 상태:', profileResponse.status);
    const profileData = await profileResponse.json();
    
    console.log('프로필 데이터 구조:', {
      resultcode: profileData.resultcode,
      message: profileData.message,
      response: profileData.response ? '데이터 존재' : '데이터 없음'
    });
    
    if (profileData.resultcode !== '00') {
      console.error('네이버 프로필 요청 실패:', profileData);
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=profile_request_failed`);
    }

    // 네이버 응답에서 이메일 체크
    if (!profileData.response || !profileData.response.email) {
      // 로그에서 어떤 필드가 있는지 확인
      console.error('네이버 프로필 데이터에 이메일이 없습니다:', 
        profileData.response ? Object.keys(profileData.response) : '응답 없음');
      
      // 프로필 응답에 email이 없는 경우 대체 로직
      // 네이버 ID + '@naver.com' 형태로 생성
      const email = profileData.response?.email || 
                   (profileData.response?.id ? `${profileData.response.id}@naver.com` : null);
      
      if (!email) {
        return NextResponse.redirect(`${BASE_URL}/auth/login?error=email_required`);
      }
      
      const naverUserId = profileData.response.id;
      const name = profileData.response.name;
      
      console.log('대체 이메일 사용:', email);
      
      // 사용자 찾기 또는 생성
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { 
              provider: 'naver',
              providerId: naverUserId 
            }
          ]
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            password: Math.random().toString(36).slice(-10),
            role: 'user',
            provider: 'naver',
            providerId: naverUserId,
            name: name || null
          }
        });
      } else if (user.provider !== 'naver') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'naver',
            providerId: naverUserId
          }
        });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET_KEY,
        { expiresIn: '7d' }
      );

      // 토큰을 쿠키에 설정하고 URL 파라미터로도 전달
      const response = NextResponse.redirect(`${BASE_URL}/?token=${token}`);
      response.cookies.set({
        name: 'authToken',
        value: token,
        maxAge: 7 * 24 * 60 * 60,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return response;
    }

    // 일반적인 경우 (email이 있을 때)
    const { email, id: naverUserId, name } = profileData.response;
    console.log('사용자 정보 획득:', { email, naverUserId, name: name || '이름 없음' });

    // 사용자 찾기 또는 생성
    console.log('DB에서 사용자 찾기 시작');
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { 
            provider: 'naver',
            providerId: naverUserId 
          }
        ]
      }
    });

    console.log('기존 사용자 찾기 결과:', user ? '사용자 찾음' : '사용자 없음');

    if (!user) {
      // 새 사용자 생성
      console.log('새 사용자 생성 시작');
      user = await prisma.user.create({
        data: {
          email,
          password: Math.random().toString(36).slice(-10), // 임의의 값
          role: 'user',
          provider: 'naver',
          providerId: naverUserId,
          name: name || null
        }
      });
      console.log('새 사용자 생성 완료:', user.id);
    } else if (user.provider !== 'naver') {
      // 기존 이메일로 가입한 사용자가 네이버 연동을 시도하는 경우
      console.log('기존 사용자 네이버 연동 시작');
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'naver',
          providerId: naverUserId
        }
      });
      console.log('사용자 업데이트 완료');
    }

    // JWT 토큰 생성
    console.log('JWT 토큰 생성 시작');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );
    console.log('JWT 토큰 생성 완료');

    // 토큰을 쿠키에 설정하고 URL 파라미터로도 전달
    console.log('쿠키 설정 및 리다이렉트');
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
    console.error('네이버 콜백 오류 발생:', error);
    
    if (error instanceof Error) {
      console.error('오류 이름:', error.name);
      console.error('오류 메시지:', error.message);
      console.error('스택 트레이스:', error.stack);
    } else {
      console.error('알 수 없는 형식의 오류:', error);
    }
    
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=auth_failed`);
  } finally {
    await prisma.$disconnect();
  }
}