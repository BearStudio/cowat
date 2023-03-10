import type { PassengersOnStops, Stop, User } from "@prisma/client";

/**
 * Get all the passengers of the given stops, wihtout the canceled ones.
 * @returns The passengers of the given stops, without the canceled ones.
 */
export const getPassengers = (
  stops: (Stop & {
    passengers: (PassengersOnStops & {
      user: User;
    })[];
  })[]
) => {
  return stops.flatMap((stop) =>
    stop.passengers.filter(
      (passenger) => passenger.requestStatus !== "CANCELED"
    )
  );
};
