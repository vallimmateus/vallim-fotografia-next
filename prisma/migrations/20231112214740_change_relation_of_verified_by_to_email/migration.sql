/*
  Warnings:

  - You are about to drop the column `validateByUserId` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[validateByUserEmail]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_validateByUserId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "validateByUserId",
ADD COLUMN     "validateByUserEmail" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_validateByUserEmail_key" ON "Event"("validateByUserEmail");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_validateByUserEmail_fkey" FOREIGN KEY ("validateByUserEmail") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;
