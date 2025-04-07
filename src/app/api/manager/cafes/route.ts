// src/app/api/manager/cafes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

export async function GET(request: Request) {
  console.log('[매니저 API] GET 요청 시작');
  
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('[매니저 API] Authorization 헤더:', authHeader ? '존재함' : '없음');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[매니저 API] 인증 토큰 없음');
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      console.log('[매니저 API] 토큰 검증 완료:', { role: decoded.role });
    } catch (jwtError) {
      console.error('[매니저 API] 토큰 검증 실패:', jwtError);
      return NextResponse.json(
        { error: '유효하지 않은 인증 토큰입니다.' },
        { status: 401 }
      );
    }

    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      console.log('[매니저 API] 권한 없음:', decoded.role);
      return NextResponse.json(
        { error: '카페 매니저만 접근할 수 있습니다.' },
        { status: 403 }
      );
    }

    console.log('[매니저 API] 카페 조회 시작:', decoded.id);

    const cafes = await prisma.cafe.findMany({
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

    console.log(`[매니저 API] 조회된 카페 수: ${cafes.length}`);

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
      cafes: formattedCafes
    });

  } catch (error) {
    console.error('[매니저 API] 오류:', error);
    return NextResponse.json({
      success: false,
      error: '카페 목록을 불러오는 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
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