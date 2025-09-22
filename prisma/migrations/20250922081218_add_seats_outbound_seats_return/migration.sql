/*
  Warnings:

  - You are about to drop the column `seats` on the `Commute` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `CommuteTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Commute" DROP COLUMN "seats",
ADD COLUMN     "seatsOutbound" INTEGER,
ADD COLUMN     "seatsReturn" INTEGER;

-- AlterTable
ALTER TABLE "CommuteTemplate" DROP COLUMN "seats",
ADD COLUMN     "seatsOutbound" INTEGER,
ADD COLUMN     "seatsReturn" INTEGER;
