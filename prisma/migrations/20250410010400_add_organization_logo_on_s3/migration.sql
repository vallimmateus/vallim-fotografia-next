/*
  Warnings:

  - You are about to drop the column `logoFileName` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[logoOriginalName]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `logoOriginalName` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoS3Key` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoUploadedByUserId` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organization_logoUrl_key";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "logoFileName",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "logoOriginalName" TEXT NOT NULL,
ADD COLUMN     "logoS3Key" TEXT NOT NULL,
ADD COLUMN     "logoUploadedByUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_logoOriginalName_key" ON "Organization"("logoOriginalName");
