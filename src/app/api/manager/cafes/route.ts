// src/app/api/manager/cafes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export async function GET(request: Request) {
  const logs: string[] = [];
  logs.push('[매니저 API] GET 요청 시작');
  logs.push(`[매니저 API] 환경 변수: NODE_ENV=${process.env.NODE_ENV}, DATABASE_URL=${process.env.DATABASE_URL ? '설정됨' : '설정되지 않음'}, JWT_SECRET_KEY=${process.env.JWT_SECRET_KEY ? '설정됨' : '설정되지 않음'}`);
  
  try {
    const authHeader = request.headers.get('Authorization');
    logs.push(`[매니저 API] Authorization 헤더: ${authHeader ? '존재함' : '없음'}`);
    
    if (!authHeader?.startsWith('Bearer ')) {
      logs.push('[매니저 API] 인증 토큰 없음');
      return NextResponse.json(
        { 
          success: false, 
          error: '권한이 없습니다.',
          logs: logs 
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      logs.push(`[매니저 API] 토큰 검증 완료: role=${decoded.role}, id=${decoded.id}`);
    } catch (jwtError) {
      logs.push('[매니저 API] 토큰 검증 실패');
      logs.push(`[매니저 API] 토큰 내용: ${token.substring(0, 20)}...`);
      return NextResponse.json(
        { 
          success: false, 
          error: '유효하지 않은 인증 토큰입니다.',
          logs: logs 
        },
        { status: 401 }
      );
    }

    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      logs.push(`[매니저 API] 권한 없음: ${decoded.role}`);
      return NextResponse.json(
        { 
          success: false, 
          error: '카페 매니저만 접근할 수 있습니다.',
          logs: logs 
        },
        { status: 403 }
      );
    }

    logs.push(`[매니저 API] 카페 조회 시작: ${decoded.id}`);

    // Prisma 클라이언트 상태 확인
    logs.push('[매니저 API] Prisma 클라이언트 상태 확인');
    try {
      await prisma.$connect();
      logs.push('[매니저 API] Prisma 데이터베이스 연결 성공');
    } catch (dbError) {
      logs.push(`[매니저 API] Prisma 데이터베이스 연결 실패: ${dbError}`);
      throw dbError;
    }

    logs.push('[매니저 API] 데이터베이스 쿼리 시작');
    const cafes = await prisma.$transaction(async (tx) => {
      return await tx.cafe.findMany({
        where: {
          managerId: decoded.id
        },
        include: {
          _count: {
            select: { coffees: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    });

    logs.push(`[매니저 API] 조회된 카페 수: ${cafes.length}`);
    if (cafes[0]) {
      logs.push(`[매니저 API] 첫 번째 카페 샘플: ${JSON.stringify(cafes[0], null, 2)}`);
    } else {
      logs.push('[매니저 API] 조회된 카페 없음');
    }

    const formattedCafes = cafes.map(cafe => ({
      id: cafe.id,
      name: cafe.name,
      address: cafe.address,
      phone: cafe.phone,
      coffeeCount: cafe._count.coffees,
      createdAt: cafe.createdAt,
      updatedAt: cafe.updatedAt
    }));

    return NextResponse.json({
      success: true,
      cafes: formattedCafes,
      logs: logs
    });

  } catch (error) {
    logs.push('[매니저 API] 오류 발생');
    if (error instanceof Error) {
      logs.push(`[매니저 API] 오류 메시지: ${error.message}`);
      logs.push(`[매니저 API] 오류 스택: ${error.stack}`);
    }

    return NextResponse.json({
      success: false,
      error: '카페 목록을 불러오는 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      logs: logs
    }, { 
      status: 500 
    });
  } finally {
    try {
      await prisma.$disconnect();
      logs.push('[매니저 API] Prisma 연결 종료');
    } catch (disconnectError) {
      logs.push(`[매니저 API] Prisma 연결 종료 실패: ${disconnectError}`);
    }
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };

    // 'manager'와 'cafeManager' 모두 허용
    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      return NextResponse.json(
        { error: '카페 매니저만 카페를 등록할 수 있습니다.' },
        { status: 403 }
      );
    }

    console.log("등록하는 managerId:", decoded.id); // 디버깅용

    const data = await request.json();
    
    if (!data.name || !data.address) {
      return NextResponse.json(
        { error: '카페 이름과 주소는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    // managerId를 명시적으로 설정
    const cafe = await prisma.cafe.create({
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone || '',
        description: data.description || '',
        businessHours: data.businessHours || [],
        businessHourNote: data.businessHourNote || '',
        snsLinks: data.snsLinks || [],
        managerId: decoded.id, // 명시적으로 managerId 설정
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

    console.log("생성된 카페:", cafe.id, "매니저:", cafe.managerId); // 디버깅용

    return NextResponse.json(
      { 
        success: true, 
        message: '카페가 성공적으로 등록되었습니다.',
        cafe 
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('카페 등록 에러:', error);
    
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