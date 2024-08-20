import type { Prisma } from "@prisma/client";
import ky from "ky";
import { prisma } from "@/server/db";
import type { PassengerOnStopNotification } from "@/server/events";
import { returnFieldsByEvent } from "@/utils/subscriptions";

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
    },
  });

  const stops = commute.stops.map((stop) => ({
    name: stop.location?.name,
    time: stop.time,
    address: stop.location?.address,
  }));

  const returnFields = returnFieldsByEvent["NEW_COMMUTE"];

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        [returnFields[0] ?? ""]: subscription.triggeringEvent,
        [returnFields[1] ?? ""]: commute.createdBy?.name,
        [returnFields[2] ?? ""]: commute.date,
        [returnFields[3] ?? ""]: commute.seats,
        [returnFields[4] ?? ""]: stops,
      },
    });
  });
};

const newBookingFrom = async (passengerOnStop: PassengerOnStopNotification) => {
  const driverId = passengerOnStop.stop?.commute?.createdById;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "NEW_BOOKING",
      userId: driverId,
    },
  });

  const returnFields = returnFieldsByEvent["NEW_BOOKING"];

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        [returnFields[0] ?? ""]: subscription.triggeringEvent,
        [returnFields[1] ?? ""]: passengerOnStop.stop?.commute?.createdBy?.name,
        [returnFields[2] ?? ""]: passengerOnStop.user.name,
        [returnFields[3] ?? ""]: passengerOnStop?.stop?.commute?.date,
      },
    });
  });
};

const request = async (passengerOnStop: PassengerOnStopNotification) => {
  const passengerId = passengerOnStop.user.id;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "REQUEST",
      userId: passengerId,
    },
  });

  const returnFields = returnFieldsByEvent["REQUEST"];

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        [returnFields[0] ?? ""]: subscription.triggeringEvent,
        [returnFields[1] ?? ""]: passengerOnStop.user.name,
        [returnFields[2] ?? ""]: passengerOnStop.requestStatus,
        [returnFields[3] ?? ""]: passengerOnStop.stop?.commute?.createdBy?.name,
        [returnFields[4] ?? ""]: passengerOnStop?.stop?.commute?.date,
        [returnFields[5] ?? ""]: passengerOnStop.requestComment,
      },
    });
  });
};

const bookingAutoAccepted = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const passengerId = passengerOnStop.user.id;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "AUTO_ACCEPT",
      userId: passengerId,
    },
  });

  const returnFields = returnFieldsByEvent["AUTO_ACCEPT"];

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        [returnFields[0] ?? ""]: subscription.triggeringEvent,
        [returnFields[1] ?? ""]: passengerOnStop.user.name,
        [returnFields[2] ?? ""]: passengerOnStop.stop?.commute?.createdBy?.name,
        [returnFields[3] ?? ""]: passengerOnStop?.stop?.commute?.date,
      },
    });
  });
};

const bookingCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const driverId = passengerOnStop.stop?.commute?.createdById;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "BOOKING_CANCELED",
      userId: driverId,
    },
  });

  const returnFields = returnFieldsByEvent["BOOKING_CANCELED"];

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        [returnFields[0] ?? ""]: subscription.triggeringEvent,
        [returnFields[1] ?? ""]: passengerOnStop.stop?.commute?.createdBy?.name,
        [returnFields[2] ?? ""]: passengerOnStop.user.name,
        [returnFields[3] ?? ""]: passengerOnStop?.stop?.commute?.date,
      },
    });
  });
};

const commuteCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const passengerId = passengerOnStop.user.id;
  const subscriptions = await prisma.subscription.findMany({
    where: {
      triggeringEvent: "COMMUTE_CANCELED",
      userId: passengerId,
    },
  });

  const returnFields = returnFieldsByEvent["COMMUTE_CANCELED"];

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        [returnFields[0] ?? ""]: subscription.triggeringEvent,
        [returnFields[1] ?? ""]: passengerOnStop.user.name,
        [returnFields[2] ?? ""]: passengerOnStop.stop?.commute?.createdBy?.name,
        [returnFields[3] ?? ""]: passengerOnStop?.stop?.commute?.date,
      },
    });
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
