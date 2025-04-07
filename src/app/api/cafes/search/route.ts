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
  
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const notes = searchParams.getAll('notes');
    const origins = searchParams.getAll('origins');
    const processes = searchParams.getAll('processes');
    const roastLevel = searchParams.getAll('roastLevel');
    const brewMethod = searchParams.getAll('brewMethod');

    console.log('[검색 API] 검색 파라미터:', {
      keyword,
      notes,
      origins,
      processes,
      roastLevel,
      brewMethod
    });

    let where: any = {};
    const conditions: any[] = [];

    if (keyword) {
      conditions.push({
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          {
            coffees: {
              some: {
                OR: [
                  { name: { contains: keyword, mode: 'insensitive' } },
                  { description: { contains: keyword, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      });
    }

    if (notes.length > 0) {
      conditions.push({
        coffees: {
          some: {
            notes: {
              hasSome: notes,
            },
          },
        },
      });
    }

    if (origins.length > 0) {
      conditions.push({
        coffees: {
          some: {
            origins: {
              hasSome: origins,
            },
          },
        },
      });
    }

    if (processes.length > 0) {
      conditions.push({
        coffees: {
          some: {
            processes: {
              hasSome: processes,
            },
          },
        },
      });
    }

    if (roastLevel.length > 0) {
      conditions.push({
        coffees: {
          some: {
            roastLevel: {
              hasSome: roastLevel,
            },
          },
        },
      });
    }

    if (brewMethod.length > 0) {
      conditions.push({
        coffees: {
          some: {
            brewMethods: {
              hasSome: brewMethod,
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