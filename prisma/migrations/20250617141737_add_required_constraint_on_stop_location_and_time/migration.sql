/*
  Warnings:

  - Made the column `date` on table `Commute` required. This step will fail if there are existing NULL values in that column.
  - Made the column `locationId` on table `Stop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `time` on table `Stop` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Commute" ALTER COLUMN "date" SET NOT NULL;

-- AlterTable
ALTER TABLE "Stop" ALTER COLUMN "locationId" SET NOT NULL,
ALTER COLUMN "time" SET NOT NULL;
