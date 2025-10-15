-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "isInward" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOutward" BOOLEAN NOT NULL DEFAULT false;
