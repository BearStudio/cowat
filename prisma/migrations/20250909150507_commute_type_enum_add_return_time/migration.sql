/*
  Warnings:

  - Added the required column `returnTime` to the `Commute` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommuteType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- AlterTable
ALTER TABLE "Commute" ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "returnTime" TIMESTAMP(3) NOT NULL;
