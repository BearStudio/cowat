-- CreateEnum
-- TripType : Passenger can book a commute for round trip, oneway trip or return trip
CREATE TYPE "TripType" AS ENUM ('ROUND', 'ONEWAY', 'RETURN');

-- CreateEnum
-- CommuteType : We can create a round commute or oneway commute
CREATE TYPE "CommuteType" AS ENUM ('ROUND', 'ONEWAY');

-- AlterTable
ALTER TABLE "Commute" ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'ROUND',
ADD COLUMN     "inwardTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "outwardTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CommuteTemplate" ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'ROUND',
ADD COLUMN     "inwardTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "outwardTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PassengersOnStops" ADD COLUMN     "tripType" "TripType" NOT NULL DEFAULT 'ROUND';
