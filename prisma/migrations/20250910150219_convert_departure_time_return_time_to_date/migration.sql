/*
  Warnings:

  - The `returnTime` column on the `Commute` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `departureTime` column on the `Commute` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Commute" DROP COLUMN "returnTime",
ADD COLUMN     "returnTime" TIMESTAMP(3),
DROP COLUMN "departureTime",
ADD COLUMN     "departureTime" TIMESTAMP(3);
