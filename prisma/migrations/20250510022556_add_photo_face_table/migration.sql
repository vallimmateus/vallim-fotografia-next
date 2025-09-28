-- CreateTable
CREATE TABLE "PhotoFace" (
    "id" TEXT NOT NULL,
    "faceRekognitionId" TEXT,
    "boundingBoxTop" DOUBLE PRECISION NOT NULL,
    "boundingBoxLeft" DOUBLE PRECISION NOT NULL,
    "boundingBoxWidth" DOUBLE PRECISION NOT NULL,
    "boundingBoxHeight" DOUBLE PRECISION NOT NULL,
    "photoId" TEXT NOT NULL,
    "userId" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "mainEmotion" TEXT NOT NULL,
    "smile" BOOLEAN NOT NULL,
    "smileConfidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoFace_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PhotoFace" ADD CONSTRAINT "PhotoFace_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoFace" ADD CONSTRAINT "PhotoFace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
