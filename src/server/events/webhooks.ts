import type { Prisma } from "@prisma/client";
import ky from "ky";
import { prisma } from "@/server/db";
import type { PassengerOnStopNotification } from "@/server/events";

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

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        event: subscription.triggeringEvent,
        name: commute.createdBy?.name,
        date: commute.date,
        seats: commute.seats,
        stops,
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

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        event: subscription.triggeringEvent,
        user: passengerOnStop.stop?.commute?.createdBy?.name,
        passenger: passengerOnStop.user.name,
        date: passengerOnStop?.stop?.commute?.date,
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

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        event: subscription.triggeringEvent,
        user: passengerOnStop.user.name,
        requestStatus: passengerOnStop.requestStatus,
        driver: passengerOnStop.stop?.commute?.createdBy?.name,
        date: passengerOnStop?.stop?.commute?.date,
        comment: passengerOnStop.requestComment,
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

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        event: subscription.triggeringEvent,
        user: passengerOnStop.user.name,
        driver: passengerOnStop.stop?.commute?.createdBy?.name,
        date: passengerOnStop?.stop?.commute?.date,
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

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        event: subscription.triggeringEvent,
        user: passengerOnStop.stop?.commute?.createdBy?.name,
        passenger: passengerOnStop.user.name,
        date: passengerOnStop?.stop?.commute?.date,
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

  subscriptions?.map(async (subscription) => {
    await ky.post(subscription.endpoint, {
      json: {
        event: subscription.triggeringEvent,
        user: passengerOnStop.user.name,
        driver: passengerOnStop.stop?.commute?.createdBy?.name,
        date: passengerOnStop?.stop?.commute?.date,
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
