-- CreateEnum
CREATE TYPE "DriverStopStatus" AS ENUM ('UNKNOWN', 'HERE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('CANCELED', 'REQUESTED', 'ACCEPTED', 'REFUSED');

-- CreateEnum
CREATE TYPE "StopStatus" AS ENUM ('UNKNOWN', 'ON_TIME', 'AWAITING', 'DELAYED');

-- CreateEnum
CREATE TYPE "CommuteStatus" AS ENUM ('UNKNOWN', 'ON_TIME', 'DELAYED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stop" (
    "id" TEXT NOT NULL,
    "locationId" TEXT,
    "time" TEXT,
    "commuteId" TEXT,
    "commuteTemplateId" TEXT,
    "driverStatus" "DriverStopStatus" NOT NULL DEFAULT 'UNKNOWN',

    CONSTRAINT "Stop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassengersOnStops" (
    "userId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "requestStatus" "RequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "stopStatus" "StopStatus" NOT NULL DEFAULT 'UNKNOWN',
    "delay" INTEGER,

    CONSTRAINT "PassengersOnStops_pkey" PRIMARY KEY ("userId","stopId")
);

-- CreateTable
CREATE TABLE "CommuteTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "seats" INTEGER,
    "comment" TEXT,

    CONSTRAINT "CommuteTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commute" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN DEFAULT false,
    "createdById" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "seats" INTEGER NOT NULL,
    "status" "CommuteStatus" NOT NULL DEFAULT 'UNKNOWN',
    "delay" INTEGER,
    "comment" TEXT,

    CONSTRAINT "Commute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "ok" BOOLEAN,
    "state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "role" "UserRole" DEFAULT 'USER',
    "slackMemberId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "Location_createdById_idx" ON "Location"("createdById");

-- CreateIndex
CREATE INDEX "Stop_locationId_idx" ON "Stop"("locationId");

-- CreateIndex
CREATE INDEX "Stop_commuteId_idx" ON "Stop"("commuteId");

-- CreateIndex
CREATE INDEX "Stop_commuteTemplateId_idx" ON "Stop"("commuteTemplateId");

-- CreateIndex
CREATE INDEX "PassengersOnStops_userId_idx" ON "PassengersOnStops"("userId");

-- CreateIndex
CREATE INDEX "PassengersOnStops_stopId_idx" ON "PassengersOnStops"("stopId");

-- CreateIndex
CREATE INDEX "CommuteTemplate_createdById_idx" ON "CommuteTemplate"("createdById");

-- CreateIndex
CREATE INDEX "Commute_createdById_idx" ON "Commute"("createdById");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slackMemberId_key" ON "User"("slackMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

