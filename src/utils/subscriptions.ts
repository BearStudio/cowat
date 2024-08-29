import { Events } from "@prisma/client";

export const FIELDS_BY_EVENT: Record<Events, string[]> = {
  NEW_COMMUTE: ["event", "driver", "date", "seats", "stops"],
  NEW_BOOKING: ["event", "user", "passenger", "date"],
  REQUEST: ["event", "user", "requestStatus", "driver", "date", "comment"],
  AUTO_ACCEPT: ["event", "user", "driver", "date"],
  BOOKING_CANCELED: ["event", "user", "passenger", "date"],
  COMMUTE_CANCELED: ["event", "user", "driver", "date"],
};

export const DESCRIPTION_BY_FIELD: Record<string, string> = {
  event: "Selected event",
  driver: "Driver of the commute",
  date: "Date of the stop/commute",
  seats: "Number of seats in the commute",
  stops: "[{name: Stop name, time: HH:mm time, address; Stop address},...]",
  user: "Name of the account owner (your name)",
  passenger: "Passenger of the stop",
  requestStatus: "Status of the request (ACCEPTED/REFUSED)",
  comment: "Comment added by hand by the other user",
};

export const isValidEvent = (event: string): event is Events => {
  return Object.values(Events).includes(event as Events);
};
