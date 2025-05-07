/*
  Warnings:

  - You are about to drop the column `content` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `photo_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `cover_file_name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `logo_file_name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `published_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `comment_id` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `photo_id` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the column `logo_file_name` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `OrganizationsOnEvents` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `OrganizationsOnEvents` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Photo` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_file_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_allowedToValidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_validated` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[logoFileName]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coverFileName]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[photoId,userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[logoFileName]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,eventId]` on the table `OrganizationsOnEvents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[imageFileName,eventId]` on the table `Photo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `photoId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverFileName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoFileName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photoId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `OrganizationsOnEvents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `OrganizationsOnEvents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageFileName` to the `Photo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'organizationMember';
ALTER TYPE "Role" ADD VALUE 'photographer';

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_photo_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_photo_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationsOnEvents" DROP CONSTRAINT "OrganizationsOnEvents_event_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationsOnEvents" DROP CONSTRAINT "OrganizationsOnEvents_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_event_id_fkey";

-- DropForeignKey
ALTER TABLE "_allowedToValidate" DROP CONSTRAINT "_allowedToValidate_A_fkey";

-- DropForeignKey
ALTER TABLE "_allowedToValidate" DROP CONSTRAINT "_allowedToValidate_B_fkey";

-- DropForeignKey
ALTER TABLE "_validated" DROP CONSTRAINT "_validated_A_fkey";

-- DropForeignKey
ALTER TABLE "_validated" DROP CONSTRAINT "_validated_B_fkey";

-- DropIndex
DROP INDEX "Event_slug_key";

-- DropIndex
DROP INDEX "Like_comment_id_user_id_key";

-- DropIndex
DROP INDEX "Like_photo_id_user_id_key";

-- DropIndex
DROP INDEX "OrganizationsOnEvents_organization_id_event_id_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "content",
DROP COLUMN "created_at",
DROP COLUMN "parent_id",
DROP COLUMN "photo_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "photoId" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "cover_file_name",
DROP COLUMN "created_at",
DROP COLUMN "logo_file_name",
DROP COLUMN "published_at",
DROP COLUMN "updated_at",
ADD COLUMN     "coverFileName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdByUserId" TEXT NOT NULL,
ADD COLUMN     "logoFileName" TEXT NOT NULL,
ADD COLUMN     "publishDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "comment_id",
DROP COLUMN "created_at",
DROP COLUMN "photo_id",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "photoId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "logo_file_name",
ADD COLUMN     "logoFileName" TEXT;

-- AlterTable
ALTER TABLE "OrganizationsOnEvents" DROP COLUMN "event_id",
DROP COLUMN "organization_id",
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Photo" DROP COLUMN "event_id",
DROP COLUMN "name",
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "imageFileName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_file_name",
DROP COLUMN "created_at",
DROP COLUMN "email_verified_at",
DROP COLUMN "role",
DROP COLUMN "updated_at",
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY['user']::"Role"[];

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "_allowedToValidate";

-- DropTable
DROP TABLE "_validated";

-- CreateTable
CREATE TABLE "PhotographersOnEvents" (
    "id" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "PhotographersOnEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidatorsOnEvents" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "ValidatorsOnEvents_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "ValidatedEvents" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "ValidatedEvents_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "MembersOnOrganizations" (
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "MembersOnOrganizations_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateTable
CREATE TABLE "Photographer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Photographer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotographersOnEvents_photographerId_eventId_key" ON "PhotographersOnEvents"("photographerId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Photographer_userId_key" ON "Photographer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_logoFileName_key" ON "Event"("logoFileName");

-- CreateIndex
CREATE UNIQUE INDEX "Event_coverFileName_key" ON "Event"("coverFileName");

-- CreateIndex
CREATE UNIQUE INDEX "Like_photoId_userId_key" ON "Like"("photoId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_logoUrl_key" ON "Organization"("logoFileName");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationsOnEvents_organizationId_eventId_key" ON "OrganizationsOnEvents"("organizationId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_imageFileName_eventId_key" ON "Photo"("imageFileName", "eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotographersOnEvents" ADD CONSTRAINT "PhotographersOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotographersOnEvents" ADD CONSTRAINT "PhotographersOnEvents_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "Photographer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidatorsOnEvents" ADD CONSTRAINT "ValidatorsOnEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidatorsOnEvents" ADD CONSTRAINT "ValidatorsOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidatedEvents" ADD CONSTRAINT "ValidatedEvents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidatedEvents" ADD CONSTRAINT "ValidatedEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembersOnOrganizations" ADD CONSTRAINT "MembersOnOrganizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembersOnOrganizations" ADD CONSTRAINT "MembersOnOrganizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsOnEvents" ADD CONSTRAINT "OrganizationsOnEvents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationsOnEvents" ADD CONSTRAINT "OrganizationsOnEvents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photographer" ADD CONSTRAINT "Photographer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
