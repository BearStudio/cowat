/*
  Warnings:

  - You are about to drop the column `seats` on the `Commute` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `CommuteTemplate` table. All the data in the column will be lost.

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
ADD COLUMN     "seatsReturn" INTEGER,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CommuteTemplate" DROP COLUMN "seats",
ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "departureTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "returnTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "seatsOutbound" INTEGER,
ADD COLUMN     "seatsReturn" INTEGER;

-- AlterTable
ALTER TABLE "PassengersOnStops" ADD COLUMN     "tripType" "TripType" NOT NULL DEFAULT 'OUTBOUND';
