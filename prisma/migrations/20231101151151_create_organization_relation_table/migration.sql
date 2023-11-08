/*
  Warnings:

  - You are about to drop the column `coverURL` on the `Party` table. All the data in the column will be lost.
  - You are about to drop the column `organization` on the `Party` table. All the data in the column will be lost.
  - The `fid` column on the `Party` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `coverUrl` to the `Party` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Party" DROP COLUMN "coverURL",
DROP COLUMN "organization",
ADD COLUMN     "coverUrl" TEXT NOT NULL,
DROP COLUMN "fid",
ADD COLUMN     "fid" TEXT[];

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationsOnParties" (
    "partyId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationsOnParties_pkey" PRIMARY KEY ("partyId","organizationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_fid_key" ON "Party"("fid");

-- AddForeignKey
ALTER TABLE "OrganizationsOnParties" ADD CONSTRAINT "OrganizationsOnParties_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsOnParties" ADD CONSTRAINT "OrganizationsOnParties_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
