/*
  Warnings:

  - The values [SECTION_LEADER,ALUMNI_GUEST] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPERADMIN', 'MEMBER', 'STUDENT_GUEST');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT_GUEST';
COMMIT;

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rehearsals" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "eventId" TEXT,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rehearsals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rehearsal_songs" (
    "id" TEXT NOT NULL,
    "rehearsalId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rehearsal_songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rehearsal_blocks" (
    "id" TEXT NOT NULL,
    "rehearsalId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL DEFAULT 'CUSTOM',
    "label" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rehearsal_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rehearsal_attendances" (
    "id" TEXT NOT NULL,
    "rehearsalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "markedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rehearsal_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rehearsal_songs_rehearsalId_songId_key" ON "rehearsal_songs"("rehearsalId", "songId");

-- CreateIndex
CREATE UNIQUE INDEX "rehearsal_attendances_rehearsalId_userId_key" ON "rehearsal_attendances"("rehearsalId", "userId");

-- AddForeignKey
ALTER TABLE "rehearsals" ADD CONSTRAINT "rehearsals_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rehearsals" ADD CONSTRAINT "rehearsals_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rehearsal_songs" ADD CONSTRAINT "rehearsal_songs_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "rehearsals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rehearsal_songs" ADD CONSTRAINT "rehearsal_songs_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rehearsal_blocks" ADD CONSTRAINT "rehearsal_blocks_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "rehearsals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rehearsal_attendances" ADD CONSTRAINT "rehearsal_attendances_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "rehearsals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rehearsal_attendances" ADD CONSTRAINT "rehearsal_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
