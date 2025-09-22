import SlackNotify from "slack-notify";
import { env } from "@/env/server.mjs";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { FULL_TEXT_DATE, ONLY_TIME } from "@/constants/dates";
import { App, LogLevel } from "@slack/bolt";
import { clientEnv } from "@/env/schema.mjs";
import { commuteTypeLabels } from "@/constants/commuteType";

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
  }));

  return notify.send({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A new commute for *${dayjs(commute.date).format(
            FULL_TEXT_DATE
          )} * has been created by ${createdBy} (💺 ${
            (commute.commuteType === "OUTBOUND" ? commute.seatsOutbound : "",
            commute.commuteType === "RETURN" ? commute.seatsReturn : "",
            commute.commuteType === "ROUND"
              ? `Alley ${commute.seatsOutbound} and return : ${commute.seatsReturn}`
              : "")
          } seats available) \n Trip type : *${
            commuteTypeLabels[commute.commuteType]
          }*${
            commute.departureTime || commute.returnTime
              ? ` (${
                  commute.departureTime
                    ? `Home departure : *${dayjs(commute.departureTime).format(
                        ONLY_TIME
                      )}*`
                    : ""
                }${commute.departureTime && commute.returnTime ? " and " : ""}${
                  commute.returnTime
                    ? `Work departure : *${dayjs(commute.returnTime).format(
                        ONLY_TIME
                      )}*`
                    : ""
                })`
              : ""
          }

            \n <${clientEnv.NEXT_PUBLIC_BASE_URL}/dashboard|See all commutes>
            `,
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
                ? `${dayjs(passengerOnStop?.stop?.commute?.date).format(
                    "dddd DD MMM"
                  )} ${passengerOnStop.stop?.time}`
                : ""
            }* commute. <${
              clientEnv.NEXT_PUBLIC_BASE_URL
            }/requests|View the request>.`,
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
                ? `${dayjs(passengerOnStop.stop.commute.date).format(
                    "dddd DD MMM"
                  )} ${passengerOnStop.stop?.time}`
                : ""
            }* commute
            ${
              passengerOnStop.requestComment
                ? `and added a comment : ${passengerOnStop.requestComment}`
                : ""
            }`,
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

const bookingAutoAccepted = async (
  passengerOnStop: PassengerOnStopNotification
) => {
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
    ✅${driver} automatically accepted your request for *${
              passengerOnStop.stop.commute?.date
                ? `${dayjs(passengerOnStop.stop.commute.date).format(
                    "dddd DD MMM"
                  )}  ${passengerOnStop.stop?.time}`
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
                ? `${dayjs(passengerOnStop.stop.commute.date).format(
                    "dddd DD MMM"
                  )}  ${passengerOnStop.stop?.time}`
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

const commuteCanceled = async (
  passengerOnStop: PassengerOnStopNotification
) => {
  const driverSlackId = passengerOnStop.stop.commute?.createdBy?.slackMemberId;

  const passengerSlackId = passengerOnStop.user.slackMemberId;

  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  try {
    const result = await slackApp.client.chat.postMessage({
      channel: passengerSlackId ?? "",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🙅 ${driver} cancelled the *${
              passengerOnStop.stop.commute?.date
                ? `${dayjs(passengerOnStop.stop.commute.date).format(
                    "dddd DD MMM"
                  )} ${passengerOnStop.stop?.time}`
                : ""
            }* commute you booked.`,
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
  bookingAutoAccepted,
  bookingCanceled,
  commuteCanceled,
};
