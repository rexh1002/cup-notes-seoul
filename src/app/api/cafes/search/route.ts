import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 동적 라우트 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchParams {
  keyword: string;
  notes: string[];
  origins: string[];
  processes: string[];
  roastLevel: string[];
  brewMethod: string[];
}

export async function GET(request: Request) {
  console.log('[검색 API] GET 요청 시작');
  console.log('[검색 API] 환경 변수 확인:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '설정됨' : '설정되지 않음'
  });
  
  try {
    const { searchParams } = new URL(request.url);
    const searchParameters = {
      keyword: searchParams.get('keyword') || '',
      notes: searchParams.getAll('notes'),
      origins: searchParams.getAll('origins'),
      processes: searchParams.getAll('processes'),
      roastLevel: searchParams.getAll('roastLevel'),
      brewMethod: searchParams.getAll('brewMethod'),
    };

    const logs: string[] = [];
    logs.push('[검색 API] GET 요청 시작');
    logs.push(`[검색 API] 환경 변수: NODE_ENV=${process.env.NODE_ENV}, DATABASE_URL=${process.env.DATABASE_URL ? '설정됨' : '설정되지 않음'}`);
    logs.push(`[검색 API] 검색 파라미터: ${JSON.stringify(searchParameters, null, 2)}`);

    // Prisma 클라이언트 상태 확인
    logs.push('[검색 API] Prisma 클라이언트 상태 확인');
    try {
      await prisma.$connect();
      logs.push('[검색 API] Prisma 데이터베이스 연결 성공');
    } catch (dbError) {
      logs.push(`[검색 API] Prisma 데이터베이스 연결 실패: ${dbError}`);
      throw dbError;
    }

    let where: any = {};
    const conditions: any[] = [];

    if (searchParameters.keyword) {
      conditions.push({
        OR: [
          { name: { contains: searchParameters.keyword, mode: 'insensitive' } },
          { description: { contains: searchParameters.keyword, mode: 'insensitive' } },
          {
            coffees: {
              some: {
                OR: [
                  { name: { contains: searchParameters.keyword, mode: 'insensitive' } },
                  { description: { contains: searchParameters.keyword, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    if (searchParameters.notes?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            notes: {
              hasSome: searchParameters.notes,
            },
          },
        },
      });
    }

    if (searchParameters.origins?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            origins: {
              hasSome: searchParameters.origins,
            },
          },
        },
      });
    }

    if (searchParameters.processes?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            processes: {
              hasSome: searchParameters.processes,
            },
          },
        },
      });
    }

    if (searchParameters.roastLevel?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            roastLevel: {
              hasSome: searchParameters.roastLevel,
            },
          },
        },
      });
    }

    if (searchParameters.brewMethod?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            brewMethods: {
              hasSome: searchParameters.brewMethod,
            },
          },
        },
      });
    }

    if (conditions.length > 0) {
      where = {
        AND: conditions,
      };
    }

    console.log('[검색 API] 최종 쿼리:', JSON.stringify({ where }, null, 2));

    console.log('[검색 API] 데이터베이스 쿼리 시작');
    const cafes = await prisma.cafe.findMany({
      where,
      include: {
        coffees: {
          select: {
            id: true,
            name: true,
            roastLevel: true,
            origins: true,
            processes: true,
            notes: true,
            noteColors: true,
            brewMethods: true,
            price: true,
            description: true,
            customFields: true,
          },
        },
      },
    });

    console.log(`[검색 API] 검색 결과: ${cafes.length}개의 카페 찾음`);
    console.log('[검색 API] 첫 번째 카페 샘플:', cafes[0] ? JSON.stringify(cafes[0], null, 2) : '결과 없음');

    return NextResponse.json({
      success: true,
      cafes: cafes || [],
      total: cafes.length,
      logs: logs
    });

  } catch (error) {
    const errorLogs: string[] = [];
    errorLogs.push('[검색 API] 오류 발생');
    if (error instanceof Error) {
      errorLogs.push(`[검색 API] 오류 메시지: ${error.message}`);
      errorLogs.push(`[검색 API] 오류 스택: ${error.stack}`);
    }

    return NextResponse.json({
      success: false,
      error: '검색 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      logs: errorLogs,
      cafes: []
    }, { 
      status: 500 
    });
  } finally {
    try {
      await prisma.$disconnect();
      console.log('[검색 API] Prisma 연결 종료');
    } catch (disconnectError) {
      console.error('[검색 API] Prisma 연결 종료 실패:', disconnectError);
    }
  }
}

export async function POST(request: Request) {
  console.log('[검색 API] 요청 시작');
  
  try {
    const body = await request.json();
    console.log("[검색 API] Request body:", JSON.stringify(body, null, 2));

    const searchParams = {
      keyword: body.keyword || "",
      notes: body.notes || [],
      origins: body.origins || [],
      processes: body.processes || [],
      roastLevel: body.roastLevel || [],
      brewMethod: body.brewMethod || [],
    };

    console.log("[검색 API] 검색 파라미터:", JSON.stringify(searchParams, null, 2));

    let where: any = {};
    const conditions: any[] = [];

    if (searchParams.keyword) {
      conditions.push({
        OR: [
          { name: { contains: searchParams.keyword, mode: 'insensitive' } },
          { description: { contains: searchParams.keyword, mode: 'insensitive' } },
          {
            coffees: {
              some: {
                OR: [
                  { name: { contains: searchParams.keyword, mode: 'insensitive' } },
                  { description: { contains: searchParams.keyword, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    if (searchParams.notes?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            notes: {
              hasSome: searchParams.notes,
            },
          },
        },
      });
    }

    if (searchParams.origins?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            origins: {
              hasSome: searchParams.origins,
            },
          },
        },
      });
    }

    if (searchParams.processes?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            processes: {
              hasSome: searchParams.processes,
            },
          },
        },
      });
    }

    if (searchParams.roastLevel?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            roastLevel: {
              hasSome: searchParams.roastLevel,
            },
          },
        },
      });
    }

    if (searchParams.brewMethod?.length > 0) {
      conditions.push({
        coffees: {
          some: {
            brewMethods: {
              hasSome: searchParams.brewMethod,
            },
          },
        },
      });
    }

    // 조건이 있는 경우에만 where에 AND 추가
    if (conditions.length > 0) {
      where = {
        AND: conditions,
      };
    }

    console.log('[검색 API] 최종 쿼리:', JSON.stringify({ where }, null, 2));

    const cafes = await prisma.cafe.findMany({
      where,
      include: {
        coffees: {
          select: {
            id: true,
            name: true,
            roastLevel: true,
            origins: true,
            processes: true,
            notes: true,
            noteColors: true,
            brewMethods: true,
            price: true,
            description: true,
            customFields: true,
          },
        },
      },
    });

    console.log(`[검색 API] 검색 결과: ${cafes.length}개의 카페 찾음`);

    return NextResponse.json({
      success: true,
      cafes: cafes || [],
      total: cafes.length
    });

  } catch (error) {
    console.error('[검색 API] 오류:', error);
    return NextResponse.json({
      success: false,
      error: '검색 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
      cafes: []
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
  }
}