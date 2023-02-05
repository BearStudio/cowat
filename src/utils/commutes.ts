import type { Location, PassengersOnStops, Stop, User } from "@prisma/client";

export const getPassengers = (
  stops: (Stop & {
    location: Location | null;
    passengers: (PassengersOnStops & {
      user: User;
    })[];
  })[]
) => {
  return stops.flatMap((stop) =>
    stop.passengers
      .filter((passenger) => passenger.requestStatus !== "CANCELED")
      .map((passenger) => passenger.user)
  );
};
