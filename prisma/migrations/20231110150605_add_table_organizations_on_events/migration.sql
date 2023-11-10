/*
  Warnings:

  - You are about to drop the `_EventToOrganization` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventToOrganization" DROP CONSTRAINT "_EventToOrganization_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToOrganization" DROP CONSTRAINT "_EventToOrganization_B_fkey";

-- DropIndex
DROP INDEX "Event_name_key";

-- DropIndex
DROP INDEX "Event_slug_key";

-- DropTable
DROP TABLE "_EventToOrganization";

-- CreateTable
CREATE TABLE "OrganizationsOnEvents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "OrganizationsOnEvents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrganizationsOnEvents" ADD CONSTRAINT "OrganizationsOnEvents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsOnEvents" ADD CONSTRAINT "OrganizationsOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
