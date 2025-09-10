-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- AlterTable
ALTER TABLE "PassengersOnStops" ADD COLUMN     "tripType" "TripType" NOT NULL DEFAULT 'OUTBOUND';
