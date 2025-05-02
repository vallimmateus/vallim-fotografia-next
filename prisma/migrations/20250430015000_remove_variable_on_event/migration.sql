/*
  Warnings:

  - You are about to drop the column `logoFileName` on the `Event` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Event_logoFileName_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "logoFileName";
