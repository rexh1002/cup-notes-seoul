import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json(
      { error: 'Cafe ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      address,
      phone,
      description,
      businessHours,
      businessHourNote,
      snsLinks,
      imageUrl
    } = body;

    // Validate required fields
    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const updatedCafe = await prisma.cafe.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        address,
        phone,
        description,
        businessHours: Array.isArray(businessHours) ? businessHours : [],
        businessHourNote,
        snsLinks: Array.isArray(snsLinks) ? snsLinks : [],
        imageUrl,
      },
    });

    return NextResponse.json(updatedCafe);
  } catch (error) {
    console.error('Error updating cafe:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: '카페를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { error: '카페 정보 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
} 