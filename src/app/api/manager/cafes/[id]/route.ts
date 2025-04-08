// src/app/api/manager/cafes/[id]/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '@/app/constants';
import prisma from '@/lib/prisma';
import { verifyJwt } from "@/lib/jwt";

export const dynamic = 'force-dynamic';

// 단일 카페 조회 API
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const logs: string[] = ['Starting GET request for cafe'];
  
  try {
    // Validate cafe ID
    if (!params.id) {
      logs.push('Invalid cafe ID');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid cafe ID',
        logs 
      }, { status: 400 });
    }

    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      logs.push('Missing or invalid authorization header');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized', 
        logs 
      }, { status: 401 });
    }

    // Verify JWT token
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secret) {
      logs.push('JWT secret not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Server configuration error', 
        logs 
      }, { status: 500 });
    }

    const decoded = verifyJwt(token, secret);
    if (!decoded) {
      logs.push('Invalid JWT token');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token', 
        logs 
      }, { status: 401 });
    }

    logs.push(`User role: ${decoded.role}`);
    
    // Check user role
    if (decoded.role !== 'manager' && decoded.role !== 'cafeManager') {
      logs.push('User does not have required role');
      return NextResponse.json({ 
        success: false, 
        error: 'Forbidden', 
        logs 
      }, { status: 403 });
    }

    // Get cafe data
    const cafe = await prisma.cafe.findFirst({
      where: {
        id: params.id,
        ...(decoded.role === 'cafeManager' ? { managerId: decoded.id } : {})
      },
      include: {
        coffees: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!cafe) {
      logs.push('Cafe not found or access denied');
      return NextResponse.json({ 
        success: false, 
        error: 'Cafe not found or access denied', 
        logs 
      }, { status: 404 });
    }

    logs.push('Successfully retrieved cafe data');
    return NextResponse.json({ success: true, data: cafe, logs });

  } catch (error) {
    logs.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error', 
      logs 
    }, { status: 500 });
  }
}

// 카페 정보 업데이트 API
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[PUT 요청 시작] 카페 ID:', params.id);

    // params에서 id 추출
    const id = params.id;
    if (!id) {
      console.log('[오류] 유효하지 않은 카페 ID');
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    console.log('[인증] Authorization 헤더:', authHeader ? '존재함' : '없음');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[인증 오류] 인증 헤더 누락 또는 잘못된 형식');
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 유효성 검사
    const token = authHeader.split(' ')[1];
    console.log('[인증] 토큰 추출됨');
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      console.log('[인증] 토큰 검증 성공:', {
        userId: decoded.id,
        role: decoded.role
      });
      
      if (!decoded || typeof decoded !== 'object') {
        throw new Error('토큰 검증 실패');
      }
    } catch (jwtError) {
      console.error('[인증 오류] JWT 검증 실패:', jwtError);
      return NextResponse.json(
        { error: '인증 토큰이 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    // 권한 확인 - cafeManager 역할만 허용
    if (decoded.role !== 'cafeManager') {
      console.log('[권한 오류] 부적절한 역할:', decoded.role);
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

    console.log('[데이터베이스] 카페 조회 결과:', existingCafe ? '찾음' : '없음');

    if (!existingCafe) {
      console.log('[오류] 카페를 찾을 수 없거나 권한 없음');
      return NextResponse.json(
        { error: '카페를 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // 요청 데이터 파싱
    let data;
    try {
      data = await request.json();
      console.log('[요청] 데이터 파싱 성공:', {
        name: data.name,
        address: data.address,
        coffeesCount: data.coffees?.length
      });

      // 필수 필드 검증
      if (!data.name?.trim() || !data.address?.trim() || !data.phone?.trim()) {
        console.log('[오류] 필수 필드 누락:', {
          name: !!data.name?.trim(),
          address: !!data.address?.trim(),
          phone: !!data.phone?.trim()
        });
        return NextResponse.json(
          { error: '카페명, 주소, 전화번호는 필수 항목입니다.' },
          { status: 400 }
        );
      }

      if (!data || typeof data !== 'object') {
        console.log('[오류] 유효하지 않은 요청 데이터');
        return NextResponse.json(
          { error: '유효하지 않은 요청 데이터입니다.' },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error('[오류] 요청 데이터 파싱 실패:', parseError);
      return NextResponse.json(
        { error: '요청 데이터를 파싱할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Transaction using singleton prisma instance
    const updatedCafe = await prisma.$transaction(async (tx) => {
      // 기존 원두 정보 삭제
      if (data.coffees?.length > 0) {
        await tx.coffee.deleteMany({
          where: { cafeId: id }
        });
      }

      // 카페 정보 업데이트
      const updated = await tx.cafe.update({
        where: { id },
        data: {
          name: data.name.trim(),
          address: data.address.trim(),
          phone: data.phone.trim(),
          description: data.description?.trim() || '',
          businessHours: Array.isArray(data.businessHours) ? data.businessHours : [],
          businessHourNote: data.businessHourNote?.trim() || '',
          snsLinks: Array.isArray(data.snsLinks) ? data.snsLinks : [],
          imageUrl: data.imageUrl?.trim(),
          ...(data.coffees?.length > 0 && {
            coffees: {
              create: data.coffees.map((coffee: any) => ({
                name: coffee.name,
                price: Number(coffee.price),
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
          })
        },
        include: {
          coffees: true
        }
      });

      console.log('[데이터베이스] 업데이트 완료');
      return updated;
    });

    console.log('[성공] 카페 정보 업데이트 완료');
    return NextResponse.json({
      success: true,
      cafe: updatedCafe
    });

  } catch (error) {
    console.error('[오류] 서버 에러:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '서버 에러가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
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
    console.log('Authorization header:', authHeader); // 인증 헤더 로깅
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 401 }
      );
    }

    // JWT 유효성 검사 개선
    const token = authHeader.split(' ')[1];
    console.log('Token from header:', token); // 토큰 값 로깅
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET_KEY) as { id: string; role: string };
      console.log('Decoded token:', decoded); // 디코딩된 토큰 정보 로깅
      
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

    // 카페 및 관련 데이터 삭제
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
  }
}