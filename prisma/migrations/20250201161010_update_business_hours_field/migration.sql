/*
  Warnings:

  - You are about to drop the column `closeTime` on the `Cafe` table. All the data in the column will be lost.
  - You are about to drop the column `closedDays` on the `Cafe` table. All the data in the column will be lost.
  - You are about to drop the column `openTime` on the `Cafe` table. All the data in the column will be lost.
  - Added the required column `businessHours` to the `Cafe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snsLinks` to the `Cafe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customFields` to the `Coffee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Coffee" DROP CONSTRAINT "Coffee_cafeId_fkey";

-- AlterTable
ALTER TABLE "Cafe" DROP COLUMN "closeTime",
DROP COLUMN "closedDays",
DROP COLUMN "openTime",
ADD COLUMN     "businessHourNote" TEXT,
ADD COLUMN     "businessHours" JSONB NOT NULL,
ADD COLUMN     "snsLinks" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Coffee" ADD COLUMN     "customFields" JSONB NOT NULL,
ADD COLUMN     "noteColors" TEXT[];

-- AddForeignKey
ALTER TABLE "Coffee" ADD CONSTRAINT "Coffee_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
