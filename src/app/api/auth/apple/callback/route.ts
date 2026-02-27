import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SignJWT, importPKCS8 } from 'jose';
import dotenv from 'dotenv';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

dotenv.config();

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || '';
const APPLE_KEY_ID = process.env.APPLE_KEY_ID || '';
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cupnotescity.com';
const REDIRECT_URI = `${BASE_URL}/api/auth/apple/callback`;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export const dynamic = 'force-dynamic';

async function getAppleClientSecret(): Promise<string> {
  if (!APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY || !APPLE_CLIENT_ID) {
    throw new Error(
      'Apple OAuth env vars missing (APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CLIENT_ID)'
    );
  }
  const key = await importPKCS8(
    APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    'ES256'
  );
  const clientSecret = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: APPLE_KEY_ID })
    .setIssuer(APPLE_TEAM_ID)
    .setAudience('https://appleid.apple.com')
    .setSubject(APPLE_CLIENT_ID)
    .setIssuedAt(Math.floor(Date.now() / 1000))
    .setExpirationTime('180d')
    .sign(key);
  return clientSecret;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const idTokenParam = url.searchParams.get('id_token');
    const state = url.searchParams.get('state');

    if (!code && !idTokenParam) {
      return NextResponse.redirect(`${BASE_URL}/auth?error=no_code`);
    }

    let targetRole: 'user' | 'manager' = 'user';
    if (state) {
      try {
        const decodedState = JSON.parse(
          Buffer.from(state, 'base64url').toString('utf8')
        );
        if (decodedState.role === 'manager') targetRole = 'manager';
      } catch (e) {
        console.warn('Apple state 파싱 실패:', e);
      }
    }

    let email: string | null = null;
    let appleId: string | null = null;
    let name: string | null = null;

    if (idTokenParam) {
      const decoded = jwt.decode(idTokenParam) as { email?: string; sub: string } | null;
      if (decoded) {
        email = decoded.email || null;
        appleId = decoded.sub;
      }
    }

    if (code && (!email || !appleId)) {
      const clientSecret = await getAppleClientSecret();
      const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: APPLE_CLIENT_ID,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.id_token) {
        const decoded = jwt.decode(tokenData.id_token) as { email?: string; sub: string } | null;
        if (decoded) {
          email = email || decoded.email || null;
          appleId = decoded.sub;
        }
      }
    }

    if (!appleId) {
      return NextResponse.redirect(`${BASE_URL}/auth?error=profile_request_failed`);
    }

    if (!email) {
      return NextResponse.redirect(`${BASE_URL}/auth?error=email_not_provided`);
    }

    if (targetRole === 'manager') {
      let manager = await prisma.manager.findUnique({
        where: { email },
      });

      if (!manager) {
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        manager = await prisma.manager.create({
          data: {
            email,
            password: hashedPassword,
          },
        });
      }

      const token = jwt.sign(
        {
          id: manager.id,
          email: manager.email,
          role: 'manager',
        },
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
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { provider: 'apple', providerId: appleId }],
      },
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'user',
          provider: 'apple',
          providerId: appleId,
          name,
        },
      });
    } else if (user.provider !== 'apple' || !user.providerId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { provider: 'apple', providerId: appleId },
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
    console.error('Apple callback error:', error);
    return NextResponse.redirect(`${BASE_URL}/auth?error=auth_failed`);
  }
}

