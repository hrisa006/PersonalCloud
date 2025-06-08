-- DropForeignKey
ALTER TABLE "SharedFiles" DROP CONSTRAINT "SharedFiles_filePath_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "SharedFiles" ADD CONSTRAINT "SharedFiles_filePath_ownerId_fkey" FOREIGN KEY ("filePath", "ownerId") REFERENCES "File"("path", "userId") ON DELETE CASCADE ON UPDATE CASCADE;