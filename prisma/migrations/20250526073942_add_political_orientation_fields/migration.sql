/*
  Warnings:

  - You are about to drop the column `candidate` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the column `policies` on the `Recommendation` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Recommendation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PoliticalOrientation" ADD COLUMN     "confidence" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "reasoning" JSONB DEFAULT '{}',
ADD COLUMN     "scores" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Recommendation" DROP COLUMN "candidate",
DROP COLUMN "policies",
DROP COLUMN "reason",
ADD COLUMN     "candidateId" TEXT DEFAULT '',
ADD COLUMN     "detailedAnalysis" JSONB DEFAULT '{}',
ADD COLUMN     "differences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "matchScore" INTEGER DEFAULT 0,
ADD COLUMN     "matchingPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recommendation" TEXT DEFAULT '';
