import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

// 네이버 OAuth 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';
const NAVER_REDIRECT_URI = process.env.NAVER_REDIRECT_URI || 'http://localhost:3000/api/auth/naver/callback';
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export async function GET(request: Request) {
  try {
    // 환경 변수 확인 및 로깅
    console.log('네이버 로그인 시도 - 환경 변수 확인:');
    console.log('CLIENT_ID 존재 여부:', !!NAVER_CLIENT_ID);
    console.log('CLIENT_ID 길이:', NAVER_CLIENT_ID.length);
    console.log('CLIENT_SECRET 존재 여부:', !!NAVER_CLIENT_SECRET);
    console.log('REDIRECT_URI:', NAVER_REDIRECT_URI);

    // 환경 변수 유효성 검사
    if (!NAVER_CLIENT_ID) {
      console.error('NAVER_CLIENT_ID가 설정되지 않았습니다');
      return NextResponse.redirect('/auth/login?error=missing_client_id');
    }
    
    if (!NAVER_CLIENT_SECRET) {
      console.error('NAVER_CLIENT_SECRET이 설정되지 않았습니다');
      return NextResponse.redirect('/auth/login?error=missing_client_secret');
    }
    
    // 네이버 로그인 페이지로 리다이렉트
    const state = Math.random().toString(36).substring(2, 15);
    console.log('생성된 state:', state);
    
    // 세션이나 쿠키에 state 저장 로직 필요 (CSRF 방지)
    
    try {
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${state}`;
      console.log('네이버 인증 URL 생성 성공:', naverAuthUrl);
      
      return NextResponse.redirect(naverAuthUrl);
    } catch (urlError) {
      console.error('URL 생성 또는 리다이렉트 오류:', urlError);
      throw urlError;
    }
  } catch (error) {
    console.error('네이버 로그인 오류 상세:');
    
    // 오류 객체의 세부 정보 로깅
    if (error instanceof Error) {
      console.error('오류 이름:', error.name);
      console.error('오류 메시지:', error.message);
      console.error('스택 트레이스:', error.stack);
    } else {
      console.error('알 수 없는 형식의 오류:', error);
    }
    
    return NextResponse.redirect('/auth/login?error=naver_auth_failed');
  }
}