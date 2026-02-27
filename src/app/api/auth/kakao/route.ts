import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '';
const KAKAO_REDIRECT_URI =
  process.env.KAKAO_REDIRECT_URI ||
  'https://cupnotescity.com/api/auth/kakao/callback';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roleParam = url.searchParams.get('role');
    const role = roleParam === 'manager' ? 'manager' : 'user';

    const statePayload = Buffer.from(
      JSON.stringify({ role }),
      'utf8'
    ).toString('base64url');

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      KAKAO_REDIRECT_URI
    )}&response_type=code&state=${statePayload}`;

    return NextResponse.redirect(kakaoAuthUrl);
  } catch (error) {
    console.error('카카오 로그인 오류:', error);
    return NextResponse.redirect('/auth?error=kakao_auth_failed');
  }
}

