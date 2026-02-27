import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const NAVER_REDIRECT_URI = `${BASE_URL}/api/auth/naver/callback`;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roleParam = url.searchParams.get('role');
    const role = roleParam === 'manager' ? 'manager' : 'user';

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      console.error('네이버 OAuth 환경변수 미설정');
      return NextResponse.redirect(
        `${BASE_URL}/auth?error=naver_env_missing`
      );
    }

    const statePayload = Buffer.from(
      JSON.stringify({ role }),
      'utf8'
    ).toString('base64url');

    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      NAVER_REDIRECT_URI
    )}&state=${statePayload}`;

    return NextResponse.redirect(naverAuthUrl);
  } catch (error) {
    console.error('네이버 로그인 오류:', error);
    return NextResponse.redirect(`${BASE_URL}/auth?error=naver_auth_failed`);
  }
}

