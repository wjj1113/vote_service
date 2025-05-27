-- CreateTable
CREATE TABLE "SurveyStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voteIntentCounts" JSONB NOT NULL DEFAULT '{}',
    "partySupportCounts" JSONB NOT NULL DEFAULT '{}',
    "keyIssuesCounts" JSONB NOT NULL DEFAULT '{}',
    "regionCounts" JSONB NOT NULL DEFAULT '{}',
    "ageGroupCounts" JSONB NOT NULL DEFAULT '{}',
    "genderCounts" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "SurveyStats_pkey" PRIMARY KEY ("id")
);
