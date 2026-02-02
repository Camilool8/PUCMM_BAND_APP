/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "imageUrl",
DROP COLUMN "type",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "gradientFrom" TEXT,
ADD COLUMN     "gradientTo" TEXT,
ADD COLUMN     "gradientVia" TEXT,
ADD COLUMN     "iconGradientFrom" TEXT,
ADD COLUMN     "iconGradientTo" TEXT,
ADD COLUMN     "iconName" TEXT;
