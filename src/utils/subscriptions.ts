import { Events } from "@prisma/client";

export const EVENTS_DETAILS: Record<
  Events,
  { label: string; detail: string; fields: Array<EventField> }
> = {
  NEW_COMMUTE: {
    label: "New commute",
    detail: "You will get notified when a new commute is created",
    fields: ["event", "driver", "date", "seats", "stops"],
  },
  NEW_BOOKING: {
    label: "New booking",
    detail: "You will get notified when someone books your commute",
    fields: ["event", "user", "passenger", "date"],
  },
  REQUEST: {
    label: "Request",
    detail:
      "You will get notified when the driver responds to your booking request",
    fields: ["event", "user", "requestStatus", "driver", "date", "comment"],
  },
  AUTO_ACCEPT: {
    label: "Auto-accept",
    detail:
      "You will get notified when a commute request is accepted automatically",
    fields: ["event", "user", "driver", "date"],
  },
  BOOKING_CANCELED: {
    label: "Booking cancelled",
    detail:
      "You will get notified when a passenger cancels his booking to your commute",
    fields: ["event", "user", "passenger", "date"],
  },
  COMMUTE_CANCELED: {
    label: "Commute cancelled",
    detail:
      "You will get notified when the driver cancels a commute you booked",
    fields: ["event", "user", "driver", "date"],
  },
};

export const EVENT_FIELDS_DESCRIPTIONS = {
  event: { example: '"NEW_COMMUTE"', description: "Selected event" },
  driver: { example: '"Pierre"', description: "Driver of the commute" },
  date: { example: '"12/06/2025"', description: "Date of the stop/commute" },
  seats: { example: '"4"', description: "Number of seats in the commute" },
  stops: {
    example: '{ name: "Home", address: "12 Home Street", time: "8:05" }',
    description:
      "[{name: Stop name, time: HH:mm time, address; Stop address},...]",
  },
  user: {
    example: '"Paul"',
    description: "Name of the account owner (your name)",
  },
  passenger: { example: '"Marie"', description: "Passenger of the stop" },
  requestStatus: {
    example: '"ACCEPTED"',
    description: "Status of the request (ACCEPTED/REFUSED)",
  },
  comment: {
    example: '"Meet me at the door"',
    description: "Comment added by hand by the other user",
  },
};

type EventField = keyof typeof EVENT_FIELDS_DESCRIPTIONS;

export const isValidEvent = (event: string): event is Events => {
  return Object.keys(Events).includes(event);
};
