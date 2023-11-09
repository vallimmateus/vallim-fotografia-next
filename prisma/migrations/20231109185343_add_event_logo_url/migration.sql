/*
  Warnings:

  - Added the required column `logoUrl` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "logoUrl" TEXT NOT NULL;
