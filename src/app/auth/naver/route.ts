import { NextResponse } from 'next/server';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;
const REDIRECT_URI = 'https://cupnotescity.com/api/auth/naver/callback';
const BASE_URL = 'https://cupnotescity.com';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const state = Array.from(crypto.getRandomValues(new Uint8Array(10)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('네이버 로그인 초기화 오류:', error);
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=initialization_failed`);
  }
} 