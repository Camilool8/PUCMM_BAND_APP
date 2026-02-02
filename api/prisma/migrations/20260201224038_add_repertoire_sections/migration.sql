-- CreateTable
CREATE TABLE "repertoire_sections" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "iconName" TEXT,
    "bannerUrl" TEXT,
    "gradientFrom" TEXT,
    "gradientVia" TEXT,
    "gradientTo" TEXT,
    "iconGradientFrom" TEXT,
    "iconGradientTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repertoire_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repertoire_sections_key_key" ON "repertoire_sections"("key");
