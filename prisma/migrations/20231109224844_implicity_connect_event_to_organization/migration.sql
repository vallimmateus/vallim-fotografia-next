/*
  Warnings:

  - You are about to drop the `OrganizationsOnEvents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrganizationsOnEvents" DROP CONSTRAINT "OrganizationsOnEvents_eventId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationsOnEvents" DROP CONSTRAINT "OrganizationsOnEvents_organizationId_fkey";

-- DropTable
DROP TABLE "OrganizationsOnEvents";

-- CreateTable
CREATE TABLE "_EventToOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventToOrganization_AB_unique" ON "_EventToOrganization"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToOrganization_B_index" ON "_EventToOrganization"("B");

-- AddForeignKey
ALTER TABLE "_EventToOrganization" ADD CONSTRAINT "_EventToOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToOrganization" ADD CONSTRAINT "_EventToOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
