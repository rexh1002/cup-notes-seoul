import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

// Prisma 클라이언트 싱글톤으로 관리
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { email, password, provider, providerId, name, role } = await request.json();
    console.log('회원가입 시도:', email, provider ? `(${provider})` : '', `역할: ${role}`);

    // 소셜 로그인만 허용
    if (!provider || !providerId) {
      return NextResponse.json(
        { success: false, error: '소셜 로그인으로만 가입할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: '유효한 이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 역할 유효성 검사 (일반 사용자만 소셜 가입)
    const validRoles = ['user'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: '유효한 역할을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    // 소셜 회원가입: 랜덤 비밀번호 저장 (DB 스키마용, 사용 안 함)
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(Math.random().toString(36).slice(-10), salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role,
        provider: provider,
        providerId: providerId,
        name: name || null,
      },
    });

    console.log('회원가입 성공:', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      provider: newUser.provider
    });

    // 민감한 정보 제외
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { 
        success: false, 
        error: '회원가입 처리 중 오류가 발생했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}