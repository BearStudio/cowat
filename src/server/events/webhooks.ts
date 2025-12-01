import type { Prisma } from "@prisma/client";
import ky from "ky";
import { prisma } from "@/server/db";
import type { PassengerOnStopNotification } from "@/server/events";
import { buildWebhookBody } from "@/utils/subscriptions";

const newCommute = async (
  commute: Prisma.CommuteGetPayload<{
    include: {
      createdBy: {
        select: {
          name: true;
          email: true;
        };
      };
      stops: {
        select: {
          id: true;
          location: true;
          time: true;
        };
      };
    };
  }>
) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "NEW_COMMUTE",
      isDeleted: false,
    },
  });

  const stops = commute.stops.map((stop) => ({
    name: stop.location?.name,
    time: stop.time,
    address: stop.location?.address,
  }));

  subscriptions?.map(async (subscription) => {
    const requestBody = buildWebhookBody(subscription.url, {
      event: subscription.triggeringEvent,
      driver: commute.createdBy?.name || "",
      date: commute.date,
      seats: commute.seats,
      stops,
      commuteType : commute.commuteType,
    });
    await ky.post(subscription.url, requestBody);
  });
};

const newBookingFrom = async (passengerOnStop: PassengerOnStopNotification) => {
  const driverId = passengerOnStop.stop?.commute?.createdById;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "NEW_BOOKING",
      isDeleted: false,
      createdById: driverId,
    },
  });

  subscriptions?.map(async (subscription) => {
    const requestBody = buildWebhookBody(subscription.url, {
      event: subscription.triggeringEvent,
      user: passengerOnStop.stop?.commute?.createdBy?.name || "",
      passenger: passengerOnStop.user.name || "",
      date: passengerOnStop?.stop?.commute?.date,
      tripType : passengerOnStop.tripType
    });
    await ky.post(subscription.url, requestBody);
  });
};

const request = async (passengerOnStop: PassengerOnStopNotification) => {
  const passengerId = passengerOnStop.user.id;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "REQUEST",
      isDeleted: false,
      createdById: passengerId,
    },
  });

  subscriptions?.map(async (subscription) => {
    const requestBody = buildWebhookBody(subscription.url, {
      event: subscription.triggeringEvent,
      user: passengerOnStop.user.name || "",
      requestStatus: passengerOnStop.requestStatus,
      driver: passengerOnStop.stop?.commute?.createdBy?.name || "",
      date: passengerOnStop?.stop?.commute?.date || "",
      comment: passengerOnStop.requestComment || "",
      tripType: passengerOnStop.tripType
    });
    await ky.post(subscription.url, requestBody);
  });
};

const bookingAutoAccepted = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const driverId = passengerOnStop.stop?.commute?.createdById;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "AUTO_ACCEPT",
      isDeleted: false,
      createdById: driverId,
    },
  });

  subscriptions?.map(async (subscription) => {
    const requestBody = buildWebhookBody(subscription.url, {
      event: subscription.triggeringEvent,
      user: passengerOnStop.user.name || "",
      passenger: passengerOnStop.stop?.commute?.createdBy?.name || "",
      date: passengerOnStop?.stop?.commute?.date,
      tripType: passengerOnStop.tripType
    });
    await ky.post(subscription.url, requestBody);
  });
};

const bookingCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const driverId = passengerOnStop.stop?.commute?.createdById;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "BOOKING_CANCELED",
      isDeleted: false,
      createdById: driverId,
    },
  });

  subscriptions?.map(async (subscription) => {
    const requestBody = buildWebhookBody(subscription.url, {
      event: subscription.triggeringEvent,
      user: passengerOnStop.stop?.commute?.createdBy?.name || "",
      passenger: passengerOnStop.user.name || "",
      date: passengerOnStop?.stop?.commute?.date,
      tripType: passengerOnStop.tripType
    });
    await ky.post(subscription.url, requestBody);
  });
};

const commuteCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const passengerId = passengerOnStop.user.id;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "COMMUTE_CANCELED",
      isDeleted: false,
      createdById: passengerId,
    },
  });

  subscriptions?.map(async (subscription) => {
    const requestBody = buildWebhookBody(subscription.url, {
      event: subscription.triggeringEvent,
      user: passengerOnStop.user.name || "",
      driver: passengerOnStop.stop?.commute?.createdBy?.name || "",
      date: passengerOnStop?.stop?.commute?.date,
      commuteType: passengerOnStop.stop.commute?.commuteType
    });
    await ky.post(subscription.url, requestBody);
  });
};

export const webhooks = {
  newCommute,
  newBookingFrom,
  request,
  bookingAutoAccepted,
  bookingCanceled,
  commuteCanceled,
};
