-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "rehearsalId" TEXT;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_rehearsalId_fkey" FOREIGN KEY ("rehearsalId") REFERENCES "rehearsals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
