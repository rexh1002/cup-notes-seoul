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
    const { email, password, provider, providerId, role } = await request.json();
    console.log('회원가입 시도:', email, provider ? `(${provider})` : '', `역할: ${role}`);

    // 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: '유효한 이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 역할 유효성 검사
    const validRoles = ['user', 'cafeManager'];
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

    // 소셜 로그인 또는 일반 회원가입 처리
    let hashedPassword = '';
    
    if (provider) {
      // 소셜 로그인의 경우 랜덤 비밀번호 생성
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(Math.random().toString(36).slice(-10), salt);
    } else {
      // 일반 회원가입 - 비밀번호 유효성 검사
      if (!password || password.length < 8) {
        return NextResponse.json(
          { success: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' },
          { status: 400 }
        );
      }
      // 비밀번호 암호화
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    // 트랜잭션으로 사용자 생성
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role,
          provider: provider || null,
          providerId: providerId || null,
        },
      });

      // 카페 매니저인 경우 기본 카페 정보 생성
      if (role === 'cafeManager') {
        await tx.cafe.create({
          data: {
            name: '내 카페',
            address: '주소를 입력해주세요',
            phone: '전화번호를 입력해주세요',
            managerId: user.id,
            businessHours: [],
            snsLinks: [],
          },
        });
      }

      return user;
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