import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const REDIRECT_URI = `${BASE_URL}/api/auth/google/callback`;

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=missing_client_id`);
  }
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  return NextResponse.redirect(url);
}
