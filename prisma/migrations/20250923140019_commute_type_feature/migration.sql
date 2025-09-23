/*
  Warnings:

  - You are about to drop the column `seats` on the `Commute` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `CommuteTemplate` table. All the data in the column will be lost.
  - Made the column `locationId` on table `Stop` required. This step will fail if there are existing NULL values in that column.
  - Made the column `time` on table `Stop` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- CreateEnum
CREATE TYPE "CommuteType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- AlterTable
ALTER TABLE "Commute" DROP COLUMN "seats",
ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "departureTime" TIMESTAMP(3),
ADD COLUMN     "returnTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "seatsOutbound" INTEGER,
ADD COLUMN     "seatsReturn" INTEGER;

-- AlterTable
ALTER TABLE "CommuteTemplate" DROP COLUMN "seats",
ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "departureTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "returnTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "seatsOutbound" INTEGER,
ADD COLUMN     "seatsReturn" INTEGER,
ADD COLUMN     "templateName" TEXT;

-- AlterTable
ALTER TABLE "PassengersOnStops" ADD COLUMN     "requestComment" TEXT,
ADD COLUMN     "tripType" "TripType" NOT NULL DEFAULT 'OUTBOUND';

-- AlterTable
ALTER TABLE "Stop" ALTER COLUMN "locationId" SET NOT NULL,
ALTER COLUMN "time" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAutoAcceptEnabled" BOOLEAN NOT NULL DEFAULT false;
