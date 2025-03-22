-- DropForeignKey
ALTER TABLE "Cafe" DROP CONSTRAINT "Cafe_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Cafe" DROP CONSTRAINT "Cafe_managerId_fkey";

-- AlterTable
ALTER TABLE "Cafe" ALTER COLUMN "managerId" DROP NOT NULL,
ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Cafe" ADD CONSTRAINT "Cafe_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cafe" ADD CONSTRAINT "Cafe_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
