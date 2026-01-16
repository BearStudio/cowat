/*
  Warnings:

  - The values [REQUEST] on the enum `Events` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Events_new" AS ENUM ('NEW_BOOKING', 'NEW_COMMUTE', 'RESPONSE', 'AUTO_ACCEPT', 'BOOKING_CANCELED', 'COMMUTE_CANCELED');
ALTER TABLE "Subscription" ALTER COLUMN "triggeringEvent" TYPE "Events_new" USING ("triggeringEvent"::text::"Events_new");
ALTER TYPE "Events" RENAME TO "Events_old";
ALTER TYPE "Events_new" RENAME TO "Events";
DROP TYPE "Events_old";
COMMIT;
