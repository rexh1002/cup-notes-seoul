import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const REDIRECT_URI = `${BASE_URL}/api/auth/apple/callback`;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const roleParam = url.searchParams.get('role');
  const role = roleParam === 'manager' ? 'manager' : 'user';

  if (!APPLE_CLIENT_ID) {
    return NextResponse.redirect(`${BASE_URL}/auth?error=missing_client_id`);
  }

  const statePayload = Buffer.from(
    JSON.stringify({ role }),
    'utf8'
  ).toString('base64url');

  const authUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(
    APPLE_CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code%20id_token&response_mode=query&scope=name%20email&state=${encodeURIComponent(
    statePayload
  )}`;

  return NextResponse.redirect(authUrl);
}

