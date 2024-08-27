-- CreateEnum
CREATE TYPE "Events" AS ENUM ('NEW_BOOKING', 'NEW_COMMUTE', 'REQUEST', 'AUTO_ACCEPT', 'BOOKING_CANCELED', 'COMMUTE_CANCELED');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "triggeringEvent" "Events" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
