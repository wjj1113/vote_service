/*
  Warnings:

  - The primary key for the `Party` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[candidateId,title]` on the table `Policy` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_partyId_fkey";

-- AlterTable
ALTER TABLE "Candidate" ALTER COLUMN "partyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Party" DROP CONSTRAINT "Party_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Party_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Party_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Policy_candidateId_title_key" ON "Policy"("candidateId", "title");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
