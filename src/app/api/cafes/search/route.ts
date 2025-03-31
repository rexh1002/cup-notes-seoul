import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 싱글톤으로 관리
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 동적 라우트 설정
export const dynamic = 'force-dynamic';

interface SearchParams {
  keyword: string;
  notes: string[];
  origins: string[];
  processes: string[];
  roastLevel: string[];
  brewMethod: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body received:", body);

    const searchParams = {
      keyword: body.keyword || "",
      notes: body.notes || [],
      origins: body.origins || [],
      processes: body.processes || [],
      roastLevel: body.roastLevel || [],
      brewMethod: body.brewMethod || [],
    };

    console.log("Received search params:", searchParams);

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

    console.log('Final query:', JSON.stringify({ where }, null, 2));

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

    return NextResponse.json({
      success: true,
      cafes: cafes || [],
      total: cafes.length
    });

  } catch (error) {
    console.error('Search error:', error);
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