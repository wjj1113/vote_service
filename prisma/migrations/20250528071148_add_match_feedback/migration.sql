-- CreateTable
CREATE TABLE "MatchFeedback" (
    "id" SERIAL NOT NULL,
    "orientationId" INTEGER NOT NULL,
    "candidateId" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchFeedback_pkey" PRIMARY KEY ("id")
);
