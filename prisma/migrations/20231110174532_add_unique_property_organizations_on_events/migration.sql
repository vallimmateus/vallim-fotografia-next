/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,eventId]` on the table `OrganizationsOnEvents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrganizationsOnEvents_organizationId_eventId_key" ON "OrganizationsOnEvents"("organizationId", "eventId");
