/*
  Warnings:

  - You are about to drop the column `imageURL` on the `Photo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageUrlId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageUrlId` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Photo_imageURL_key";

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "imageURL",
ADD COLUMN     "imageUrlId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Photo_imageUrlId_key" ON "Photo"("imageUrlId");
