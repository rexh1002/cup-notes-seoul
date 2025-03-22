import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdmin() {
  try {
    const admin = await prisma.admin.findMany();
    console.log('Admin 데이터:', admin);
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdmin();
