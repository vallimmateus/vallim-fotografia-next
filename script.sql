
> vallim-fotografia@2.1.2 npx
> prisma migrate diff --from-url=postgres://postgres.gzfqrsggfarwhhmvoqyp:Mv6095810901.!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres --to-schema-datamodel=./prisma/schema.prisma --script

-- DropIndex
DROP INDEX "Organization_logoUrl_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "source";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "logoUrl",
ADD COLUMN     "slug" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SourceData";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

