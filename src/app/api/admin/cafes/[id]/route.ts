import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'default-secret-key';

interface UserPayload extends JwtPayload {
  role: string;
  id: string;
}

function decodeToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('토큰 디코딩 실패:', error instanceof Error ? error.message : error);
    return null;
  }
}

// GET 요청: 특정 카페 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cafeId = params?.id;

    if (!cafeId) {
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      include: {
        coffees: true,
      },
    });

    if (!cafe) {
      return NextResponse.json(
        { error: '카페를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(cafe);
  } catch (error) {
    console.error('카페 조회 에러:', error);
    return NextResponse.json(
      { error: '카페 정보를 조회하는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT 요청: 특정 카페 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cafeId = params?.id;

    if (!cafeId) {
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // 권한 체크
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다. Authorization 헤더가 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const user = decodeToken(token);

    if (!user || !user.id) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 관리자가 아닌 경우 매니저 권한 확인
    if (user.role !== 'admin') {
      const cafe = await prisma.cafe.findUnique({
        where: { id: cafeId },
        select: { managerId: true },
      });

      if (!cafe) {
        return NextResponse.json(
          { error: '카페를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      if (cafe.managerId !== user.id) {
        return NextResponse.json(
          { error: '해당 카페를 수정할 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    // 기존 커피 정보 삭제
    await prisma.coffee.deleteMany({
      where: { cafeId },
    });

    // 카페 정보 업데이트
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone || '',
        description: data.description || '',
        businessHours: data.businessHours || [],
        businessHourNote: data.businessHourNote || '',
        snsLinks: data.snsLinks || [],
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
            customFields: coffee.customFields || {
              origins: [],
              processes: [],
              brewMethods: [],
              roastLevels: [],
              notes: {
                floral: [],
                fruity: [],
                nutty: []
              },
            },
          })),
        },
      },
      include: {
        coffees: true,
      },
    });

    return NextResponse.json(updatedCafe);
  } catch (error) {
    console.error('카페 수정 에러:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: '카페 정보를 수정하는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE 요청: 특정 카페 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cafeId = params?.id;

    if (!cafeId) {
      return NextResponse.json(
        { error: '유효하지 않은 카페 ID입니다.' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '권한이 없습니다. Authorization 헤더가 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const user = decodeToken(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: '권한이 없습니다. 관리자만 삭제할 수 있습니다.' },
        { status: 403 }
      );
    }

    const deletedCafe = await prisma.cafe.delete({
      where: { id: cafeId },
    });

    console.log('카페 삭제 성공:', deletedCafe.id);

    return NextResponse.json({ success: true, data: deletedCafe });
  } catch (error) {
    console.error('카페 삭제 에러:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: '카페 삭제에 실패했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
