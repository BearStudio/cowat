import type { PassengersOnStops, User, Stop } from "@prisma/client";

/**
 * Get all the passengers of the given stops, wihtout the canceled ones.
 * @returns The passengers of the given stops, without the canceled ones.
 */
export const getPassengers = (
  stops: Array<
    Stop & {
      passengers: Array<
        PassengersOnStops & {
          user: User;
        }
      >;
    }
  >
) => {
  return stops.flatMap((stop) =>
    stop.passengers.filter(
      (passenger) =>
        passenger.requestStatus !== "CANCELED" &&
        passenger.requestStatus !== "REFUSED"
    )
  );
};

/**
 * Get all the passengers of the given stops, only accepted ones.
 * @returns The passengers of the given stops, only accepted ones.
 */
export const getAcceptedPassengers = (
  stops: Array<
    Stop & {
      passengers: Array<
        PassengersOnStops & {
          user: User;
        }
      >;
    }
  >
) => {
  return stops.flatMap((stop) =>
    stop.passengers.filter(
      (passenger) => passenger.requestStatus === "ACCEPTED"
    )
  );
};

/**
 * Check if there are passengers on this stop
 * @param stop The stop to check if there are passengers on it
 * @returns a boolean with the answer
 */
export const havePassengerOnStop = (
  stop: Stop & {
    passengers: Array<PassengersOnStops>;
  }
) => {
  return stop.passengers.some(
    (passenger) =>
      passenger.requestStatus !== "CANCELED" &&
      passenger.requestStatus !== "REFUSED"
  );
};
