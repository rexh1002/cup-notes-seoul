import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

// 카카오 OAuth 설정
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '';
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || 'https://www.cupnotescity.com/api/auth/kakao/callback';

export async function GET(request: Request) {
  try {
    // 카카오 로그인 페이지로 리다이렉트
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    
    return NextResponse.redirect(kakaoAuthUrl);
  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    return NextResponse.redirect('/auth/login?error=kakao_auth_failed');
  }
}