import type { PassengersOnStops, Stop, User } from "@prisma/client";
import type { RouterOutputs } from "@/utils/api";

type CommuteType = RouterOutputs["commute"]["commuteById"];
type PassengerWithUser = PassengersOnStops & { user: User };
type StopWithPassengers = Stop & { passengers: PassengerWithUser[] };

/**
 * Get all the passengers of the given stops, wihtout the canceled ones.
 * @returns The passengers of the given stops, without the canceled ones.
 */
export const getPassengers = (
  stops: StopWithPassengers[],
  tripType: "ROUND" | "ONEWAY" | "RETURN"
) => {
  return stops.flatMap((stop) =>
    stop.passengers.filter(
      (passenger) =>
        passenger.requestStatus !== "CANCELED" &&
        passenger.requestStatus !== "REFUSED" &&
        ((tripType === "ONEWAY" &&
          (passenger.tripType === "ONEWAY" ||
            passenger.tripType === "ROUND")) ||
          (tripType === "RETURN" &&
            (passenger.tripType === "RETURN" ||
              passenger.tripType === "ROUND")) ||
          tripType === "ROUND")
    )
  );
};

export const getAllPassengers = (
  stops: StopWithPassengers[]
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
export const getAcceptedPassengers = (stops: StopWithPassengers[]) => {
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

/**
 * Get the earliest time of the commute
 * @param commute The commute in which we want to find the earliest stop
 * @returns The time of the earliest stop
 */
export const getFirstStopTime = (commute: CommuteType) => {
  return commute?.stops.map((stop) => stop.time).sort()[0];
};
