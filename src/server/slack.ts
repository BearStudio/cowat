import SlackNotify from "slack-notify";
import { env } from "@/env/server.mjs";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { FULL_TEXT_DATE_WITH_TIME, TIMEZONE_NAME } from "@/constants/dates";
import { App, LogLevel } from "@slack/bolt";

type PassengerOnStopNotification = Prisma.PassengersOnStopsGetPayload<{
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

export const BOOK_ACTION_ID = "book";

export const notify = SlackNotify(env.SLACK_WEBHOOK_URL);

export const slackApp = new App({
  token: env.SLACK_BOT_TOKEN,
  signingSecret: env.SLACK_SIGNING_SECRET,
  logLevel: env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.WARN,
});

const newCommute = async (
  commute: Prisma.CommuteGetPayload<{
    include: {
      createdBy: {
        select: {
          slackMemberId: true;
          email: true;
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
  const slackUserId = commute.createdBy?.slackMemberId;

  const createdBy = slackUserId
    ? `<@${slackUserId}>`
    : commute.createdBy?.email;

  const locationsSlack = commute.stops.map((stop) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `📍 *${stop.location?.name}${
        stop.time ? ` - ${stop.time}` : ""
      }*\n${stop.location?.address}`,
    },
    accessory: {
      type: "button",
      text: {
        type: "plain_text",
        text: "Book",
        emoji: true,
      },
      value: stop.id,
      action_id: BOOK_ACTION_ID,
    },
  }));

  return notify.send({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A new commute for *${dayjs(commute.date)
            .tz("Europe/Paris")
            .format(
              FULL_TEXT_DATE_WITH_TIME
            )} ${TIMEZONE_NAME}* has been created by ${createdBy} (💺 ${
            commute.seats
          } seats available)`,
        },
      },
      {
        type: "divider",
      },
      ...locationsSlack,
      ...(commute.comment
        ? [
            {
              type: "divider",
            },
            {
              type: "context",
              elements: [
                {
                  type: "plain_text",
                  text: commute.comment,
                  emoji: true,
                },
              ],
            },
          ]
        : []),
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const newBookingFrom = async (passengerOnStop: PassengerOnStopNotification) => {
  const driverSlackId = passengerOnStop.stop?.commute?.createdBy?.slackMemberId;

  const passengerSlackId = passengerOnStop.user.slackMemberId;

  const passenger = passengerSlackId
    ? `<@${passengerSlackId}>`
    : passengerOnStop.stop?.commute?.createdBy?.email ?? "";

  try {
    // Call the chat.postMessage method using the WebClient
    const result = await slackApp.client.chat.postMessage({
      channel: driverSlackId ?? "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey, 🙋 ${passenger} requested a seat on your *${
              passengerOnStop.stop?.commute?.date
                ? `${dayjs(passengerOnStop?.stop?.commute?.date)
                    .tz("Europe/Paris")
                    .format("dddd DD MMM HH:mm")} ${TIMEZONE_NAME}`
                : ""
            }* commute.`,
          },
        },
      ],
    });

    // TODO: handle result not OK with some logsnag or else
    console.log(result);
  } catch (error) {
    // TODO: handle with some tool to store errors
    console.error(error);
  }
};

const request = async (passengerOnStop: PassengerOnStopNotification) => {
  const driverSlackId = passengerOnStop.stop.commute?.createdBy?.slackMemberId;

  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  const passengerSlackId = passengerOnStop.user.slackMemberId;

  const passenger = passengerSlackId
    ? `<@${passengerSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  try {
    const result = await slackApp.client.chat.postMessage({
      channel: passengerSlackId ?? "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey ${passenger},
    ${
      passengerOnStop.requestStatus === "ACCEPTED" ? "✅" : "❌"
    } ${driver} ${passengerOnStop.requestStatus.toLocaleLowerCase()} your request for *${
              passengerOnStop.stop.commute?.date
                ? `${dayjs(passengerOnStop.stop.commute.date)
                    .tz("Europe/Paris")
                    .format("dddd DD MMM HH:mm")} ${TIMEZONE_NAME}`
                : ""
            }* commute.`,
          },
        },
      ],
    });

    // TODO: handle result not OK with some logsnag or else
    console.log(result);
  } catch (error) {
    // TODO: handle with some tool to store errors
    console.error(error);
  }
};

const bookingCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const driverSlackId = passengerOnStop.stop.commute?.createdBy?.slackMemberId;

  const passengerSlackId = passengerOnStop.user.slackMemberId;

  const passenger = passengerSlackId
    ? `<@${passengerSlackId}>`
    : passengerOnStop.stop?.commute?.createdBy?.email ?? "";

  try {
    const result = await slackApp.client.chat.postMessage({
      channel: driverSlackId ?? "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🙅 ${passenger} cancelled their booking for the *${
              passengerOnStop.stop.commute?.date
                ? `${dayjs(passengerOnStop.stop.commute.date)
                    .tz("Europe/Paris")
                    .format("dddd DD MMM HH:mm")} ${TIMEZONE_NAME}`
                : ""
            }* commute.`,
          },
        },
      ],
    });

    // TODO: handle result not OK with some logsnag or else
    console.log(result);
  } catch (error) {
    // TODO: handle with some tool to store errors
    console.error(error);
  }
};

export const slack = {
  newBookingFrom,
  newCommute,
  request,
  bookingCanceled,
};
