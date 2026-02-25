import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const REDIRECT_URI = `${BASE_URL}/api/auth/apple/callback`;

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!APPLE_CLIENT_ID) {
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=missing_client_id`);
  }
  const state = Math.random().toString(36).substring(2, 15);
  const url = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(APPLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code%20id_token&response_mode=query&scope=name%20email&state=${state}`;
  return NextResponse.redirect(url);
}
