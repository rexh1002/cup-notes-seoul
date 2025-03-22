import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.create({
    data: {
      username: 'admin',
      email: 'wjdgycjs@gmail.com',
      password: 'admin123',
    },
  });

  await prisma.manager.create({
    data: {
      email: 'manager@example.com',
      password: 'securepassword',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
