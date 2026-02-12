-- AlterTable: Add multi-provider authentication fields to users
ALTER TABLE "users" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "users" ADD COLUMN "googleId" TEXT;
ALTER TABLE "users" ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'azure_ad';
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: Unique constraint on googleId
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
