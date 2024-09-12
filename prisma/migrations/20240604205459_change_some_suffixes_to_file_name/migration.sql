/*
  Warnings:

  - You are about to drop the column `cover_image_path` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `logo_image_path` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `logo_image_path` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_image_path` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "cover_image_path",
DROP COLUMN "logo_image_path",
ADD COLUMN     "cover_file_name" TEXT,
ADD COLUMN     "logo_file_name" TEXT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "logo_image_path",
ADD COLUMN     "logo_file_name" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar_image_path",
ADD COLUMN     "avatar_file_name" TEXT;
