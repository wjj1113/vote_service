-- CreateTable
CREATE TABLE "ConsultationRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "consultType" TEXT NOT NULL,
    "consultMemo" TEXT,
    "stage" TEXT,
    "concern" TEXT,
    "timePref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);
