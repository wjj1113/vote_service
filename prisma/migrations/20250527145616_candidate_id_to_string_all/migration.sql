/*
  Warnings:

  - The primary key for the `Candidate` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "VoteIntent" DROP CONSTRAINT "VoteIntent_candidateId_fkey";

-- AlterTable
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_pkey",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Candidate_id_seq";

-- AlterTable
ALTER TABLE "Policy" ALTER COLUMN "candidateId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "VoteIntent" ALTER COLUMN "candidateId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteIntent" ADD CONSTRAINT "VoteIntent_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
