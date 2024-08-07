import type { Prisma } from "@prisma/client";
import { webhooks } from "@/server/events/webhooks";
import { slack } from "@/server/slack";

export type PassengerOnStopNotification = Prisma.PassengersOnStopsGetPayload<{
  include: {
    stop: {
      include: {
        commute: {
          include: {
            createdBy: {
              include: {
                accounts: true;
              };
            };
          };
        };
      };
    };
    user: {
      include: {
        accounts: true;
      };
    };
  };
}>;

const newCommute = async (
  commute: Prisma.CommuteGetPayload<{
    include: {
      createdBy: {
        select: {
          slackMemberId: true;
          email: true;
          name: true;
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
  webhooks.newCommute(commute);
  slack.newCommute(commute);
};

const newBookingFrom = async (passengerOnStop: PassengerOnStopNotification) => {
  webhooks.newBookingFrom(passengerOnStop);
  slack.newBookingFrom(passengerOnStop);
};

const request = async (passengerOnStop: PassengerOnStopNotification) => {
  webhooks.request(passengerOnStop);
  slack.request(passengerOnStop);
};

const bookingAutoAccepted = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  webhooks.bookingAutoAccepted(passengerOnStop);
  slack.bookingAutoAccepted(passengerOnStop);
};

const bookingCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  webhooks.bookingCanceled(passengerOnStop);
  slack.bookingCanceled(passengerOnStop);
};

const commuteCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  webhooks.commuteCanceled(passengerOnStop);
  slack.commuteCanceled(passengerOnStop);
};

export const events = {
  newCommute,
  newBookingFrom,
  request,
  bookingAutoAccepted,
  bookingCanceled,
  commuteCanceled,
};
