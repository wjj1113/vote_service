/*
  Warnings:

  - The primary key for the `Policy` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Policy` table. All the data in the column will be lost.
  - You are about to drop the column `issue` on the `Policy` table. All the data in the column will be lost.
  - Added the required column `budget` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goal` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `implementation` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Policy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Policy" DROP CONSTRAINT "Policy_pkey",
DROP COLUMN "description",
DROP COLUMN "issue",
ADD COLUMN     "budget" TEXT NOT NULL,
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "goal" TEXT NOT NULL,
ADD COLUMN     "implementation" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Policy_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Policy_id_seq";
