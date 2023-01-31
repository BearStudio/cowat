import SlackNotify from "slack-notify";
import { env } from "@/env/server.mjs";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";

export const notify = SlackNotify(env.SLACK_WEBHOOK_URL);

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
          text: `Dear ${driver}, ${passenger} requested to be part of your ${
            passengerOnStop.stop.commute?.date
              ? dayjs(passengerOnStop.stop.commute.date).format("DD/MM/YYYY")
              : ""
          } commute`,
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

export const slack = {
  newBookingFrom,
};
