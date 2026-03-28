/*
  Warnings:

  - Made the column `emailVerifyToken` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isVerified` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailVerifyToken" SET NOT NULL,
ALTER COLUMN "emailVerifyToken" SET DEFAULT '',
ALTER COLUMN "isVerified" SET NOT NULL,
ALTER COLUMN "isVerified" SET DEFAULT false;
