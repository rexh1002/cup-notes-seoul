// src/app/api/manager/cafes/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

// 단일 카페 조회 API
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // params에서 id 추출
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 유효성 검사 개선
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('토큰 검증 실패');
      }
    } catch (jwtError) {
      console.error('JWT 검증 오류:', jwtError);
      return NextResponse.json(
        { error: '인증 토큰이 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    // manager, cafeManager 역할 모두 허용
    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      return NextResponse.json(
        { error: '카페 매니저만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 카페 ID로 상세 정보 조회
    const cafe = await prisma.cafe.findUnique({
      where: {
        id,
        managerId: decoded.id // 자신의 카페만 조회 가능
      },
      include: {
        coffees: true // 원두 정보 포함
      }
    });

    if (!cafe) {
      return NextResponse.json(
        { error: '카페를 찾을 수 없거나 접근 권한이 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cafe
    });

  } catch (error) {
    console.error('카페 상세 조회 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 카페 정보 업데이트 API
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // params에서 id 추출
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 유효성 검사 개선
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('토큰 검증 실패');
      }
    } catch (jwtError) {
      console.error('JWT 검증 오류:', jwtError);
      return NextResponse.json(
        { error: '인증 토큰이 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    // manager, cafeManager 역할 모두 허용
    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      return NextResponse.json(
        { error: '카페 매니저만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 카페 존재 및 권한 확인
    const existingCafe = await prisma.cafe.findFirst({
      where: {
        id,
        managerId: decoded.id
      }
    });

    if (!existingCafe) {
      return NextResponse.json(
        { error: '카페를 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 요청 데이터 파싱 및 유효성 검사
    let data;
    try {
      data = await request.json();
      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { error: '유효하지 않은 요청 데이터입니다.' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('요청 본문 파싱 오류:', parseError);
      return NextResponse.json(
        { error: '요청 데이터를 파싱할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 카페 및 원두 정보 업데이트
    const updatedCafe = await prisma.$transaction(async (tx) => {
      // 기존 원두 정보 삭제
      await tx.coffee.deleteMany({
        where: {
          cafeId: id
        }
      });

      // 카페 정보 업데이트
      const cafe = await tx.cafe.update({
        where: {
          id
        },
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone || '',
          description: data.description || '',
          businessHours: data.businessHours || [],
          businessHourNote: data.businessHourNote || '',
          snsLinks: data.snsLinks || [],
          // 새 원두 정보 생성
          coffees: {
            create: (data.coffees || []).map((coffee: any) => ({
              name: coffee.name,
              price: coffee.price,
              roastLevel: coffee.roastLevel || [],
              origins: coffee.origins || [],
              processes: coffee.processes || [],
              notes: coffee.notes || [],
              noteColors: coffee.noteColors || [],
              brewMethods: coffee.brewMethods || [],
              description: coffee.description || '',
              customFields: coffee.customFields || {}
            }))
          }
        },
        include: {
          coffees: true
        }
      });

      return cafe;
    });

    return NextResponse.json({
      success: true,
      message: '카페 정보가 성공적으로 업데이트되었습니다.',
      cafe: updatedCafe
    });

  } catch (error: any) {
    console.error('카페 업데이트 에러:', error);
    
    // Prisma 관련 에러 처리
    if (error.code) {
      return NextResponse.json(
        { 
          error: '데이터베이스 에러가 발생했습니다.',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 카페 삭제 API
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // params에서 id 추출
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 유효성 검사 개선
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('토큰 검증 실패');
      }
    } catch (jwtError) {
      console.error('JWT 검증 오류:', jwtError);
      return NextResponse.json(
        { error: '인증 토큰이 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    // manager, cafeManager 역할 모두 허용
    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      return NextResponse.json(
        { error: '카페 매니저만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    // 카페 존재 및 권한 확인
    const existingCafe = await prisma.cafe.findFirst({
      where: {
        id,
        managerId: decoded.id
      }
    });

    if (!existingCafe) {
      return NextResponse.json(
        { error: '카페를 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 카페 및 관련 데이터 삭제 (onDelete: Cascade 설정이 되어있다면 coffees는 자동 삭제)
    await prisma.cafe.delete({
      where: {
        id
      }
    });

    return NextResponse.json({
      success: true,
      message: '카페가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('카페 삭제 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}