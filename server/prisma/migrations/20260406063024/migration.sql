-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailVerifyToken" DROP NOT NULL,
ALTER COLUMN "emailVerifyToken" DROP DEFAULT;
