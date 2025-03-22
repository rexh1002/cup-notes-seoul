/*
  Warnings:

  - Added the required column `adminId` to the `Cafe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "email" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Cafe" ADD COLUMN     "adminId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Cafe" ADD CONSTRAINT "Cafe_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
