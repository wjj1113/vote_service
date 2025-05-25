-- CreateTable
CREATE TABLE "PoliticalOrientation" (
    "id" SERIAL NOT NULL,
    "rawInput" TEXT NOT NULL,
    "tendency" TEXT NOT NULL,
    "valueBase" TEXT NOT NULL,
    "interests" TEXT[],
    "voteBase" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoliticalOrientation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" SERIAL NOT NULL,
    "orientationId" INTEGER NOT NULL,
    "candidate" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "policies" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_orientationId_key" ON "Recommendation"("orientationId");

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_orientationId_fkey" FOREIGN KEY ("orientationId") REFERENCES "PoliticalOrientation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
