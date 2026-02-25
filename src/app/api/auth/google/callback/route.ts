import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from '@/lib/prisma';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const REDIRECT_URI = `${BASE_URL}/api/auth/google/callback`;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) {
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=no_code`);
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('Google token error:', tokenData);
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=token_request_failed`);
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    const email = profile.email;
    const googleId = profile.id;
    const name = profile.name || null;

    if (!email) {
      return NextResponse.redirect(`${BASE_URL}/auth/login?error=email_not_provided`);
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { provider: 'google', providerId: googleId }],
      },
    });

    if (!user) {
      const signupUrl = `${BASE_URL}/auth/login?error=signup_required&provider=google&email=${encodeURIComponent(email)}&providerId=${googleId}&name=${encodeURIComponent(name || '')}`;
      return NextResponse.redirect(signupUrl);
    }

    if (user.provider !== 'google' || !user.providerId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider: 'google', providerId: googleId },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    const response = NextResponse.redirect(`${BASE_URL}/?token=${token}`);
    response.cookies.set({
      name: 'authToken',
      value: token,
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.redirect(`${BASE_URL}/auth/login?error=auth_failed&msg=${encodeURIComponent(msg)}`);
  }
}
