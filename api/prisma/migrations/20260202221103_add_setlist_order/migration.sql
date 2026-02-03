-- CreateTable: EventSong junction table with order
CREATE TABLE "event_songs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ConcertSong junction table with order
CREATE TABLE "concert_songs" (
    "id" TEXT NOT NULL,
    "concertId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concert_songs_pkey" PRIMARY KEY ("id")
);

-- Migrate existing data from _EventToSong to event_songs
INSERT INTO "event_songs" ("id", "eventId", "songId", "order", "createdAt")
SELECT
    gen_random_uuid()::text,
    "A" as "eventId",
    "B" as "songId",
    ROW_NUMBER() OVER (PARTITION BY "A" ORDER BY "B") - 1 as "order",
    CURRENT_TIMESTAMP
FROM "_EventToSong";

-- Migrate existing data from _ConcertSongs to concert_songs
INSERT INTO "concert_songs" ("id", "concertId", "songId", "order", "createdAt")
SELECT
    gen_random_uuid()::text,
    "A" as "concertId",
    "B" as "songId",
    ROW_NUMBER() OVER (PARTITION BY "A" ORDER BY "B") - 1 as "order",
    CURRENT_TIMESTAMP
FROM "_ConcertSongs";

-- CreateIndex
CREATE UNIQUE INDEX "event_songs_eventId_songId_key" ON "event_songs"("eventId", "songId");

-- CreateIndex
CREATE UNIQUE INDEX "concert_songs_concertId_songId_key" ON "concert_songs"("concertId", "songId");

-- AddForeignKey
ALTER TABLE "event_songs" ADD CONSTRAINT "event_songs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_songs" ADD CONSTRAINT "event_songs_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concert_songs" ADD CONSTRAINT "concert_songs_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concert_songs" ADD CONSTRAINT "concert_songs_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey (old implicit tables)
ALTER TABLE "_ConcertSongs" DROP CONSTRAINT "_ConcertSongs_A_fkey";
ALTER TABLE "_ConcertSongs" DROP CONSTRAINT "_ConcertSongs_B_fkey";
ALTER TABLE "_EventToSong" DROP CONSTRAINT "_EventToSong_A_fkey";
ALTER TABLE "_EventToSong" DROP CONSTRAINT "_EventToSong_B_fkey";

-- DropTable (old implicit tables)
DROP TABLE "_ConcertSongs";
DROP TABLE "_EventToSong";
