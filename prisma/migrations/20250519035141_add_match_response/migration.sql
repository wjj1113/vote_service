-- CreateTable
CREATE TABLE "MatchResponse" (
    "id" SERIAL NOT NULL,
    "recommendedCandidate" TEXT NOT NULL,
    "recommendationReason" TEXT NOT NULL,
    "keyPolicies" TEXT[],
    "matched" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchResponse_pkey" PRIMARY KEY ("id")
);
