/*
  Warnings:

  - You are about to drop the column `imageFileName` on the `Photo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originalName,eventId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalName` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedByUserId` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Photo_imageFileName_eventId_key";

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "imageFileName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "uploadedByUserId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PhotoVersion" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "format" TEXT NOT NULL,

    CONSTRAINT "PhotoVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoVersion_width_height_photoId_key" ON "PhotoVersion"("width", "height", "photoId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_originalName_eventId_key" ON "Photo"("originalName", "eventId");

-- AddForeignKey
ALTER TABLE "PhotoVersion" ADD CONSTRAINT "PhotoVersion_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
