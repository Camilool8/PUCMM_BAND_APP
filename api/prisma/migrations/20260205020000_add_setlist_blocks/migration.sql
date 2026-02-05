-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('INTERLUDE', 'INTRODUCTION', 'BREAK', 'TRANSITION', 'CUSTOM');

-- CreateTable
CREATE TABLE "event_blocks" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL DEFAULT 'CUSTOM',
    "label" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concert_blocks" (
    "id" TEXT NOT NULL,
    "concertId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL DEFAULT 'CUSTOM',
    "label" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concert_blocks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_blocks" ADD CONSTRAINT "event_blocks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concert_blocks" ADD CONSTRAINT "concert_blocks_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
