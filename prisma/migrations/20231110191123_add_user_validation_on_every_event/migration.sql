/*
  Warnings:

  - A unique constraint covering the columns `[name,date]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_slug_date_key";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "validateByUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_name_date_key" ON "Event"("name", "date");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_validateByUserId_fkey" FOREIGN KEY ("validateByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
