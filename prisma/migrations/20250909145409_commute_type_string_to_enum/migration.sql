/*
  Warnings:

  - The `commuteType` column on the `Commute` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CommuteType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- AlterTable
ALTER TABLE "Commute" DROP COLUMN "commuteType",
ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND';
