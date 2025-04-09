// src/app/api/manager/cafes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || '';

export const dynamic = 'force-dynamic';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

function verifyJwt(token: string, secret: string): JwtPayload | null {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Helper function to verify JWT token and get user info
async function verifyToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET_KEY) as { id: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to verify manager role and cafe ownership
async function verifyManagerAndCafe(managerId: string, cafeId: string) {
  const cafe = await prisma.cafe.findFirst({
    where: {
      id: cafeId,
      managerId: managerId,
    },
  });
  return cafe;
}

// Helper function to handle common error responses
function errorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

// 단일 카페 조회 API
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const logs: (string | Record<string, any>)[] = [];
  const cafeId = params.id;

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return errorResponse('No token provided', 401);
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'manager') {
      return errorResponse('Unauthorized role', 403);
    }

    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      include: {
        manager: {
          select: {
            id: true,
            email: true,
          },
        },
        coffees: true,
      },
    });

    if (!cafe) {
      return errorResponse('Cafe not found', 404);
    }

    return NextResponse.json(cafe);
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return errorResponse('Failed to fetch cafe', 500);
  }
}

// 카페 정보 업데이트 API
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const logs: (string | Record<string, any>)[] = [];
  const cafeId = params.id;

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return errorResponse('No token provided', 401);
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'manager') {
      return errorResponse('Unauthorized role', 403);
    }

    const cafe = await verifyManagerAndCafe(decoded.id, cafeId);
    if (!cafe) {
      return errorResponse('Cafe not found or unauthorized', 404);
    }

    const body = await request.json();
    const {
      name,
      address,
      phone,
      description,
      businessHours,
      imageUrl,
      businessHourNote,
      snsLinks,
      coffees,
    } = body;

    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: {
        name,
        address,
        phone,
        description,
        businessHours,
        imageUrl,
        businessHourNote,
        snsLinks,
        coffees: {
          deleteMany: {},
          create: coffees.map((coffee: any) => ({
            name: coffee.name,
            price: coffee.price,
            roastLevel: coffee.roastLevel,
            origins: coffee.origins,
            processes: coffee.processes,
            notes: coffee.notes,
            noteColors: coffee.noteColors,
            brewMethods: coffee.brewMethods,
            description: coffee.description,
            customFields: coffee.customFields,
          })),
        },
      },
      include: {
        coffees: true,
      },
    });

    return NextResponse.json(updatedCafe);
  } catch (error) {
    console.error('Error updating cafe:', error);
    return errorResponse('Failed to update cafe', 500);
  }
}

// 카페 삭제 API
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const logs: (string | Record<string, any>)[] = [];
  const cafeId = params.id;

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return errorResponse('No token provided', 401);
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'manager') {
      return errorResponse('Unauthorized role', 403);
    }

    const cafe = await verifyManagerAndCafe(decoded.id, cafeId);
    if (!cafe) {
      return errorResponse('Cafe not found or unauthorized', 404);
    }

    await prisma.cafe.delete({
      where: { id: cafeId },
    });

    return NextResponse.json({ message: 'Cafe deleted successfully' });
  } catch (error) {
    console.error('Error deleting cafe:', error);
    return errorResponse('Failed to delete cafe', 500);
  }
}