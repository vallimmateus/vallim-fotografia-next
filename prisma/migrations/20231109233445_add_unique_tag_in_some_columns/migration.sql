/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logoUrl]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coverUrl]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logoUrl]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Event_name_key" ON "Event"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_logoUrl_key" ON "Event"("logoUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Event_coverUrl_key" ON "Event"("coverUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_logoUrl_key" ON "Organization"("logoUrl");
