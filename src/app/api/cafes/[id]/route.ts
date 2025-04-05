import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, address, description, imageUrl } = body;

    const updatedCafe = await prisma.cafe.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        address,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(updatedCafe);
  } catch (error) {
    console.error('Error updating cafe:', error);
    return NextResponse.json(
      { error: 'Failed to update cafe' },
      { status: 500 }
    );
  }
} 