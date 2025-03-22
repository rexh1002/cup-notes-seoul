/*
  Warnings:

  - The primary key for the `Cafe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ownerId` on the `Cafe` table. All the data in the column will be lost.
  - The primary key for the `Coffee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Cafe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Coffee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cafe" DROP CONSTRAINT "Cafe_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Coffee" DROP CONSTRAINT "Coffee_cafeId_fkey";

-- AlterTable
ALTER TABLE "Cafe" DROP CONSTRAINT "Cafe_pkey",
DROP COLUMN "ownerId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "openTime" DROP NOT NULL,
ALTER COLUMN "closeTime" DROP NOT NULL,
ADD CONSTRAINT "Cafe_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Cafe_id_seq";

-- AlterTable
ALTER TABLE "Coffee" DROP CONSTRAINT "Coffee_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "cafeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Coffee_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Coffee_id_seq";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "Coffee" ADD CONSTRAINT "Coffee_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
