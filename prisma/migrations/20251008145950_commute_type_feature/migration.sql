-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ROUND', 'ONEWAY', 'RETURN');

-- CreateEnum
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
