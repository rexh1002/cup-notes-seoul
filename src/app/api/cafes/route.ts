import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cafes = await prisma.cafe.findMany({
      include: {
        coffees: {
          select: {
            id: true,
            name: true,
            roastLevel: true,
            origins: true,
            processes: true,
            notes: true,
            brewMethods: true,
            price: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json({ cafes });
  } catch (error) {
    console.error('Error fetching cafes:', error);
    return NextResponse.json(
      { 
        error: '카페 목록을 불러오는 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}