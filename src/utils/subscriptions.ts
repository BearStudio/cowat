import { Events } from "@prisma/client";
import dayjs from "dayjs";

export const EVENTS_DETAILS: Record<
  Events,
  {
    label: string;
    detail: string;
    fields: Array<EventField>;
    message: (
      data: Partial<Record<EventField, string | object | number>>
    ) => string;
  }
> = {
  NEW_COMMUTE: {
    label: "New commute",
    detail: "You will get notified when a new commute is created",
    message: (data: Partial<Record<EventField, string | object | number>>) =>
      `${data.driver} has created a commute on ${dayjs(
        data.date?.toString()
      ).format("DD/MM/YYYY HH:mm")}`,
    fields: ["event", "driver", "date", "seats", "stops"],
  },
  NEW_BOOKING: {
    label: "New booking",
    detail: "You will get notified when someone books your commute",
    message: (data: Partial<Record<EventField, string | object | number>>) =>
      `${data.passenger} has requested a booking for your commute on ${dayjs(
        data.date?.toString()
      ).format("DD/MM/YYYY HH:mm")}`,
    fields: ["event", "user", "passenger", "date"],
  },
  REQUEST: {
    label: "Request",
    detail:
      "You will get notified when the driver responds to your booking request",
    message: (data: Partial<Record<EventField, string | object | number>>) =>
      `${data.driver} has ${data.requestStatus} your commute on ${dayjs(
        data.date?.toString()
      ).format("DD/MM/YYYY HH:mm")}`,
    fields: ["event", "user", "requestStatus", "driver", "date", "comment"],
  },
  AUTO_ACCEPT: {
    label: "Auto-accept",
    detail:
      "You will get notified when a commute request is accepted automatically",
    message: (data: Partial<Record<EventField, string | object | number>>) =>
      `${data.passenger} has booked your commute on ${dayjs(
        data.date?.toString()
      ).format("DD/MM/YYYY HH:mm")}`,
    fields: ["event", "user", "passenger", "date"],
  },
  BOOKING_CANCELED: {
    label: "Booking cancelled",
    detail:
      "You will get notified when a passenger cancels his booking to your commute",
    message: (data: Partial<Record<EventField, string | object | number>>) =>
      `${data.passenger} has cancelled his booking for your commute on ${dayjs(
        data.date?.toString()
      ).format("DD/MM/YYYY HH:mm")}`,
    fields: ["event", "user", "passenger", "date"],
  },
  COMMUTE_CANCELED: {
    label: "Commute cancelled",
    detail:
      "You will get notified when the driver cancels a commute you booked",
    message: (data: Partial<Record<EventField, string | object | number>>) =>
      `${data.driver} has cancelled your commute on ${dayjs(
        data.date?.toString()
      ).format("DD/MM/YYYY HH:mm")}`,
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

const DOMAIN_CONTENT_KEY = {
  discord: "content",
  slack: "text",
} as const;

type DomainContentKey = keyof typeof DOMAIN_CONTENT_KEY;

export const getWebhookDomain = (webhookUrl: string): DomainContentKey => {
  const supportedDomains = Object.keys(
    DOMAIN_CONTENT_KEY
  ) as DomainContentKey[];

  // use slack by default, which adds the message in a "text" field
  let webhookDomain = "slack";
  supportedDomains.forEach((domain) => {
    if (webhookUrl.includes(domain)) {
      webhookDomain = domain;
    }
  });
  return webhookDomain as DomainContentKey;
};

export const buildWebhookBody = (
  webhookUrl: string,
  baseBody: Partial<Record<EventField, string | object | number>>
) => {
  const domainContentKey = DOMAIN_CONTENT_KEY[getWebhookDomain(webhookUrl)];

  const enventMessage =
    EVENTS_DETAILS[baseBody.event as Events].message(baseBody);

  return {
    json: {
      ...baseBody,
      [domainContentKey]: enventMessage,
    },
  };
};

export const isValidEvent = (event: string): event is Events => {
  return Object.keys(Events).includes(event);
};
