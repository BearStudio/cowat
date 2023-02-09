import SlackNotify from "slack-notify";
import { env } from "@/env/server.mjs";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { FULL_TEXT_DATE_WITH_TIME } from "@/constants/dates";

export const notify = SlackNotify(env.SLACK_WEBHOOK_URL);

const newCommute = async (
  commute: Prisma.CommuteGetPayload<{
    include: {
      createdBy: {
        select: {
          accounts: true;
          email: true;
        };
      };
      stops: {
        select: {
          location: true;
          time: true;
        };
      };
    };
  }>
) => {
  const slackUserId = commute.createdBy?.accounts.find(
    (account) => account.provider === "slack"
  )?.providerAccountId;

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
    // accessory: {
    //   type: "button",
    //   text: {
    //     type: "plain_text",
    //     emoji: true,
    //     text: "Maps",
    //   },
    //   value: "value",
    //   url: searchOnMaps(stop.location?.address ?? ""),
    //   action_id: "button-action",
    // },
  }));

  return notify.send({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `A new commute for *${dayjs(commute.date).format(
            FULL_TEXT_DATE_WITH_TIME
          )}* has been created by ${createdBy} (💺 ${
            commute.seats
          } seats available) @here`,
        },
        // accessory: {
        //   type: "button",
        //   text: {
        //     type: "plain_text",
        //     text: "Check",
        //     emoji: true,
        //   },
        //   value: "click_me_123",
        //   url: "http://localhost:3000/commutes",
        //   action_id: "button-action",
        // },
      },
      {
        type: "divider",
      },
      ...locationsSlack,
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
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const newBookingFrom = (
  passengerOnStop: Prisma.PassengersOnStopsGetPayload<{
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
  }>
) => {
  const driverSlackId = passengerOnStop.stop.commute?.createdBy?.accounts.find(
    (account) => account.provider === "slack"
  )?.providerAccountId;

  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  const passengerSlackId = passengerOnStop.user.accounts.find(
    (account) => account.provider === "slack"
  )?.providerAccountId;

  const passenger = passengerSlackId
    ? `<@${passengerSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  return notify.send({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey ${driver},
🙋 ${passenger} requested a seat on your *${
            passengerOnStop.stop.commute?.date
              ? dayjs(passengerOnStop.stop.commute.date).format(
                  "dddd DD MMM HH:mm"
                )
              : ""
          }* commute.`,
        },
      },
      // TODO: coming later, action to accept or refuse from slack
      // {
      //   type: "actions",
      //   elements: [
      //     {
      //       type: "button",
      //       text: {
      //         type: "plain_text",
      //         emoji: true,
      //         text: "Approve",
      //       },
      //       style: "primary",
      //       value: "click_me_123",
      //     },
      //     {
      //       type: "button",
      //       text: {
      //         type: "plain_text",
      //         emoji: true,
      //         text: "Deny",
      //       },
      //       style: "danger",
      //       value: "click_me_123",
      //     },
      //   ],
      // },
    ],

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
};

const request = (
  passengerOnStop: Prisma.PassengersOnStopsGetPayload<{
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
  }>
) => {
  const driverSlackId = passengerOnStop.stop.commute?.createdBy?.accounts.find(
    (account) => account.provider === "slack"
  )?.providerAccountId;

  const driver = driverSlackId
    ? `<@${driverSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  const passengerSlackId = passengerOnStop.user.accounts.find(
    (account) => account.provider === "slack"
  )?.providerAccountId;

  const passenger = passengerSlackId
    ? `<@${passengerSlackId}>`
    : passengerOnStop.stop.commute?.createdBy?.email ?? "";

  return notify.send({
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
              ? dayjs(passengerOnStop.stop.commute.date).format(
                  "dddd DD MMM HH:mm"
                )
              : ""
          }* commute.`,
        },
      },
    ],
  } as any);
};

export const slack = {
  newBookingFrom,
  newCommute,
  request,
};
