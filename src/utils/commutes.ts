import type {
  CommuteStatus,
  DriverStopStatus,
  Location,
  PassengersOnStops,
  User,
  Stop,
  RequestStatus,
  StopStatus,
} from "@prisma/client";

export type PassengersOnStopsType = {
  user: User;
  userId: string;
  stopId: string;
  requestStatus: RequestStatus;
  stopStatus: StopStatus;
  delay: number | null;
};

export type StopType = {
  id: string;
  locationId: string | null;
  location: Location | null;
  time: string | null;
  commuteId: string | null;
  commuteTemplateId: string | null;
  passengers: PassengersOnStopsType[];
  driverStatus: DriverStopStatus;
};

export type CommuteType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean | null;
  createdBy: User | null;
  createdById: string;
  date: Date;
  seats: number;
  status: CommuteStatus;
  delay: number | null;
  stops: StopType[];
  comment: string | null;
};

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
