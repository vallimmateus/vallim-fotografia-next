/*
  Warnings:

  - A unique constraint covering the columns `[slug,date]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_date_key" ON "Event"("slug", "date");
