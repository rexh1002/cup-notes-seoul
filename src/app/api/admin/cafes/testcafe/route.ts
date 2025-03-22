import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// 카페 정보 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id: params.id },
      include: { coffees: true }
    });
    
    if (!cafe) {
      return NextResponse.json(
        { error: '카페를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(cafe);
  } catch (error) {
    return NextResponse.json(
      { error: '카페 정보 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 카페 정보 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    // 기존 커피 정보 삭제
    await prisma.coffee.deleteMany({
      where: { cafeId: params.id }
    });
    
    // 카페 정보 업데이트
    const cafe = await prisma.cafe.update({
      where: { id: params.id },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        description: data.description,
        openTime: data.openTime,
        closeTime: data.closeTime,
        closedDays: data.closedDays,
        coffees: {
          create: data.coffees.map((coffee: any) => ({
            name: coffee.name,
            price: coffee.price,
            roastLevel: coffee.roastLevel,
            origins: coffee.origins,
            description: coffee.description
          }))
        }
      }
    });
    
    return NextResponse.json(cafe);
  } catch (error) {
    return NextResponse.json(
      { error: '카페 정보 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 카페 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.cafe.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: '카페 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}