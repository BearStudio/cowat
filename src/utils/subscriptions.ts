import { Events } from "@prisma/client";
import { getFirstStopTime } from "@/utils/commutes";
import dayjs from "dayjs";
import type { RouterOutputs } from "@/utils/api";

type WebhookBody = Partial<
  Record<EventField, string | object | number | Array<unknown>>
>;

export const EVENTS_DETAILS: Record<
  Events,
  {
    label: string;
    detail: string;
    fields: Array<EventField>;
    message: (data: WebhookBody) => string;
  }
> = {
  NEW_COMMUTE: {
    label: "New commute",
    detail: "You will get notified when a new commute is created",
    message: (data: WebhookBody) =>
      `${data.driver} has created a commute on ${buildCommuteDateTime(data)}`,
    fields: ["event", "driver", "date", "seats", "stops", "commuteType"],
  },
  NEW_BOOKING: {
    label: "New booking",
    detail: "You will get notified when someone books your commute",
    message: (data: WebhookBody) =>
      `${
        data.passenger
      } has requested a booking for your commute on ${buildCommuteDateTime(
        data
      )}`,
    fields: ["event", "user", "passenger", "date", "stops" ,"tripType"],
  },
  RESPONSE: {
    label: "Response",
    detail:
      "You will get notified when the driver responds to your booking request",
    message: (data: WebhookBody) =>
      `${data.driver} has ${
        data.requestStatus
      } your booking request for the commute on ${buildCommuteDateTime(data)}`,
    fields: ["event", "user", "requestStatus", "driver", "date", "comment", "tripType"],
  },
  AUTO_ACCEPT: {
    label: "Auto-accept",
    detail:
      "You will get notified when a commute request is accepted automatically",
    message: (data: WebhookBody) =>
      `${data.passenger} has booked your commute on ${buildCommuteDateTime(
        data
      )}`,
    fields: ["event", "user", "passenger", "date", "tripType"],
  },
  BOOKING_CANCELED: {
    label: "Booking cancelled",
    detail:
      "You will get notified when a passenger cancels his booking to your commute",
    message: (data: WebhookBody) =>
      `${
        data.passenger
      } has cancelled his booking for your commute on ${buildCommuteDateTime(
        data
      )}`,
    fields: ["event", "user", "passenger", "date", "tripType"],
  },
  COMMUTE_CANCELED: {
    label: "Commute cancelled",
    detail:
      "You will get notified when the driver cancels a commute you booked",
    message: (data: WebhookBody) =>
      `${data.driver} has cancelled your commute on ${buildCommuteDateTime(
        data
      )}`,
    fields: ["event", "user", "driver", "date", "commuteType"],
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
  commuteType : {
    example: "ROUND",
    description: "Type of commute",
  },
  tripType : {
    example : "RETURN",
    description: "Type of booking",
  }
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

export const buildWebhookBody = (webhookUrl: string, baseBody: WebhookBody) => {
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

const buildCommuteDateTime = (data: WebhookBody) => {
  console.log({ date: dayjs(data.date as Date).format("DD/MM/YYYY") });
  return `${dayjs(data.date as Date).format("DD/MM/YYYY")} ${getFirstStopTime(
    data?.stops as RouterOutputs["commute"]["commuteById"]["stops"]
  )}`;
};
