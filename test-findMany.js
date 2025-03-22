const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFindMany() {
  try {
    // 쿼리 조건 설정 (빈 where 조건)
    const where = {
      AND: [],
    };

    // findMany 실행
    const cafes = await prisma.cafe.findMany({ where });

    // 쿼리 결과 출력
    console.log('쿼리 결과:', cafes);
  } catch (error) {
    console.error('쿼리 실행 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect(); // Prisma 연결 종료
  }
}

// 함수 실행
testFindMany();
