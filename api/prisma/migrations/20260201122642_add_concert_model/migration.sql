/*
  Warnings:

  - You are about to drop the column `date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "concertId" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "songId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "events" DROP COLUMN "date",
DROP COLUMN "location",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "concerts" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ConcertSongs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ConcertSongs_AB_unique" ON "_ConcertSongs"("A", "B");

-- CreateIndex
CREATE INDEX "_ConcertSongs_B_index" ON "_ConcertSongs"("B");

-- AddForeignKey
ALTER TABLE "concerts" ADD CONSTRAINT "concerts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConcertSongs" ADD CONSTRAINT "_ConcertSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConcertSongs" ADD CONSTRAINT "_ConcertSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
