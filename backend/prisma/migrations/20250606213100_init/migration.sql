/*
  Warnings:

  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `filename` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `File` table. All the data in the column will be lost.
  - The primary key for the `SharedFiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileId` on the `SharedFiles` table. All the data in the column will be lost.
  - Added the required column `userId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `SharedFiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `SharedFiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SharedFiles" DROP CONSTRAINT "SharedFiles_fileId_fkey";

-- DropIndex
DROP INDEX "File_path_key";

-- AlterTable
ALTER TABLE "File" DROP CONSTRAINT "File_pkey",
DROP COLUMN "filename",
DROP COLUMN "id",
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "File_pkey" PRIMARY KEY ("path", "userId");

-- AlterTable
ALTER TABLE "SharedFiles" DROP CONSTRAINT "SharedFiles_pkey",
DROP COLUMN "fileId",
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "ownerId" UUID NOT NULL,
ADD CONSTRAINT "SharedFiles_pkey" PRIMARY KEY ("filePath", "ownerId", "userId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFiles" ADD CONSTRAINT "SharedFiles_filePath_ownerId_fkey" FOREIGN KEY ("filePath", "ownerId") REFERENCES "File"("path", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
