/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Photo_name_key" ON "Photo"("name");
