/*
  Warnings:

  - You are about to drop the column `s3Key` on the `Photo` table. All the data in the column will be lost.
  - Added the required column `fileName` to the `PhotoVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "s3Key";

-- AlterTable
ALTER TABLE "PhotoVersion" ADD COLUMN     "fileName" TEXT NOT NULL;
