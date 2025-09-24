-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- CreateEnum
CREATE TYPE "CommuteType" AS ENUM ('ROUND', 'OUTBOUND', 'RETURN');

-- AlterTable
ALTER TABLE "Commute" ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "departureTime" TIMESTAMP(3),
ADD COLUMN     "returnTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CommuteTemplate" ADD COLUMN     "commuteType" "CommuteType" NOT NULL DEFAULT 'OUTBOUND',
ADD COLUMN     "departureTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "returnTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PassengersOnStops" ADD COLUMN     "tripType" "TripType" NOT NULL DEFAULT 'OUTBOUND';
