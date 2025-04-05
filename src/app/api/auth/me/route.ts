import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

export const dynamic = 'force-dynamic';  // 동적 렌더링 설정

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

// 사용자 정의 타입
interface UserPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

function decodeToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET_KEY) as UserPayload;
  } catch (error) {
    console.error('토큰 디코딩 실패:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다. Authorization 헤더가 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const user = decodeToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('인증 상태 확인 실패:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
