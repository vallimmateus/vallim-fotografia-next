/*
  Warnings:

  - You are about to drop the column `partyId` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationsOnParties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Party` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventId` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrganizationsOnParties" DROP CONSTRAINT "OrganizationsOnParties_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationsOnParties" DROP CONSTRAINT "OrganizationsOnParties_partyId_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_partyId_fkey";

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "partyId",
ADD COLUMN     "eventId" TEXT NOT NULL;

-- DropTable
DROP TABLE "OrganizationsOnParties";

-- DropTable
DROP TABLE "Party";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fid" TEXT[],
    "date" TIMESTAMP(3) NOT NULL,
    "publishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationsOnEvents" (
    "eventId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationsOnEvents_pkey" PRIMARY KEY ("eventId","organizationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_fid_key" ON "Event"("fid");

-- AddForeignKey
ALTER TABLE "OrganizationsOnEvents" ADD CONSTRAINT "OrganizationsOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsOnEvents" ADD CONSTRAINT "OrganizationsOnEvents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
