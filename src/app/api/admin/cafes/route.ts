// src/app/api/admin/cafes/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '@/lib/prisma';

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';
const prismaClient = new PrismaClient();

interface UserPayload extends JwtPayload {
  role: string;
  id: string;
}

const validateToken = (token: string): UserPayload | null => {
  try {
    console.log('3. 토큰 검증 시작');
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as UserPayload;
    console.log('4. 토큰 검증 성공:', { role: decoded.role, id: decoded.id });
    return decoded;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return null;
  }
};

export const dynamic = 'force-dynamic';

// POST 요청: 카페 생성
export async function POST(request: Request) {
  console.log('1. POST 요청 시작');

  try {
    console.log('2. request.headers 확인:', {
      contentType: request.headers.get('Content-Type'),
      authorization: request.headers.get('Authorization')?.substring(0, 20) + '...',
    });

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('인증 헤더 없음');
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const user = validateToken(token);

    if (!user || !user.id || (user.role !== 'admin' && user.role !== 'manager')) {
      console.log('5. 권한 검증 실패:', { role: user?.role });
      return NextResponse.json(
        { success: false, error: '유효하지 않은 사용자이거나 권한이 없습니다.' },
        { status: 403 }
      );
    }

    console.log('6. 권한 검증 성공');

    const rawData = await request.text();
    console.log('7. Raw request data:', rawData);

    let data;
    try {
      data = JSON.parse(rawData);
      console.log('8. 요청 데이터 파싱 성공:', data);
    } catch (parseError) {
      console.error('9. JSON 파싱 에러:', parseError);
      return NextResponse.json(
        { success: false, error: '잘못된 요청 데이터 형식입니다.' },
        { status: 400 }
      );
    }

    if (!data.name?.trim() || !data.address?.trim()) {
      console.log('10. 필수 필드 누락:', { name: !!data.name, address: !!data.address });
      return NextResponse.json(
        { success: false, error: '카페명과 주소는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    console.log('11. 데이터 유효성 검사 통과');

    const cafeData = {
      name: data.name.trim(),
      address: data.address.trim(),
      phone: data.phone?.trim() || '',
      description: data.description?.trim() || '',
      businessHours: Array.isArray(data.businessHours) ? data.businessHours : [],
      businessHourNote: data.businessHourNote?.trim() || '',
      snsLinks: Array.isArray(data.snsLinks) ? data.snsLinks : [],
      managerId: user.role === 'manager' ? user.id : null,
      adminId: user.role === 'admin' ? user.id : null,
    };

    console.log('14. Prisma create 시작:', cafeData);

    const cafe = await prismaClient.cafe.create({
      data: cafeData,
    });

    console.log('15. 카페 생성 성공:', cafe.id);

    return NextResponse.json({ success: true, data: cafe });
  } catch (error) {
    console.error('16. 카페 생성 에러:', error);

    const errorMessage =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: '카페 등록에 실패했습니다.',
        details: errorMessage,
      },
      { status: 500 }
    );
  } finally {
    console.log('17. 데이터베이스 연결 종료');
    await prismaClient.$disconnect();
  }
}

// GET 요청: 카페 목록 조회
export async function GET() {
  console.log('GET 요청 시작');

  try {
    const cafes = await prismaClient.cafe.findMany();
    console.log('카페 목록 가져오기 성공:', cafes);

    return NextResponse.json(
      { success: true, data: cafes },
      { status: 200 }
    );
  } catch (error) {
    console.error('카페 목록 가져오기 실패:', error);
    return NextResponse.json(
      { success: false, error: '카페 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    console.log('데이터베이스 연결 종료');
    await prismaClient.$disconnect();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔥 1. DELETE 요청 시작');

  try {
    // ✅ Next.js 동적 경로 params 가져오기
    const cafeId = params?.id;
    console.log('🔥 2. 삭제하려는 카페 ID:', cafeId);

    if (!cafeId) {
      console.error('🚨 3. 유효하지 않은 카페 ID!');
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    // ✅ Authorization 헤더 확인
    const authHeader = request.headers.get('Authorization');
    console.log('🔥 4. Authorization 헤더:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('🚨 5. Authorization 헤더 없음 또는 잘못된 형식');
      return NextResponse.json(
        { error: '권한이 없습니다. Authorization 헤더가 필요합니다.' },
        { status: 401 }
      );
    }

    // ✅ JWT 토큰 검증
    const token = authHeader.split(' ')[1];
    console.log('🔥 6. 추출한 JWT 토큰:', token);

    let decoded: UserPayload | null = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as UserPayload;
      console.log('🔥 7. 토큰 디코딩 성공:', decoded);
    } catch (err) {
      console.error('🚨 7. 토큰 디코딩 실패:', err);
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 403 }
      );
    }

    // ✅ 관리자 권한 확인
    if (!decoded || decoded.role !== 'admin') {
      console.error('🚨 8. 삭제 권한 없음. 사용자 정보:', decoded);
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // ✅ 카페 존재 여부 확인
    const existingCafe = await prismaClient.cafe.findUnique({
      where: { id: cafeId },
    });

    if (!existingCafe) {
      console.error('🚨 9. 삭제할 카페가 존재하지 않음:', cafeId);
      return NextResponse.json(
        { error: '해당 카페를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // ✅ Prisma를 사용해 카페 삭제 시도
    console.log('🔥 10. 카페 삭제 시도. 삭제할 카페 ID:', cafeId);

    const deletedCafe = await prismaClient.cafe.delete({
      where: { id: cafeId },
    });

    console.log('✅ 11. 카페 삭제 성공:', deletedCafe);

    return NextResponse.json({ success: true, data: deletedCafe });
  } catch (error) {
    console.error('🚨 12. 카페 삭제 에러:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: '카페 삭제에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    console.log('✅ 13. Prisma 데이터베이스 연결 종료');
    await prismaClient.$disconnect();
  }
}




