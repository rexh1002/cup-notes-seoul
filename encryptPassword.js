const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function encryptAdminPassword() {
  try {
    // 데이터베이스에서 관리자 계정을 조회
    const admin = await prisma.admin.findUnique({
      where: { email: 'wjdgycjs@gmail.com' }, // 변경: 관리자의 이메일
    });

    if (!admin) {
      console.log('관리자 계정을 찾을 수 없습니다.');
      return;
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    // 암호화된 비밀번호 업데이트
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });

    console.log('비밀번호 암호화 및 업데이트 완료');
  } catch (error) {
    console.error('비밀번호 암호화 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

encryptAdminPassword();
