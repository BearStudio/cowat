import { prisma } from "@/server/db";
import { notify } from "@/server/slack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { NextApiRequest, NextApiResponse } from "next";

dayjs.extend(utc);

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const commutes = await prisma?.commute.findMany({
    where: {
      date: {
        gte: dayjs.utc().startOf("day").toDate(),
        lte: dayjs.utc().endOf("day").toDate(),
      },
      isDeleted: false,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      stops: {
        orderBy: {
          time: "asc",
        },
        include: {
          location: {
            select: {
              address: true,
              name: true,
            },
          },
          passengers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            where: {
              requestStatus: {
                in: ["ACCEPTED"],
              },
            },
          },
        },
      },
    },
  });

  const messageOfTheDay = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: commutes?.length ? "Today's commutes" : "No commutes today",
          emoji: true,
        },
      },
      ...(commutes.length
        ? [
            {
              type: "divider",
            },
            ...commutes
              .map((commute) => [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `*${
                      commute.createdBy?.name ?? commute.createdBy?.email
                    }'s commute*\n${dayjs(commute.date).format(
                      "dddd, MMMM DD"
                    )} \n${commute.stops.length} stop(s)\n${
                      commute.stops.flatMap((stop) => stop.passengers).length
                    } passenger(s)`,
                  },
                  accessory: {
                    type: "image",
                    image_url: commute.createdBy?.image,
                    alt_text:
                      commute.createdBy?.name ?? commute.createdBy?.email,
                  },
                },
                ...commute.stops.flatMap((stop) => [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `:round_pushpin: *${stop.location?.address}${
                        stop.time ? ` - ${stop.time}` : ""
                      }*\n${stop.location?.name}.`,
                    },
                  },
                  ...stop.passengers.map((passenger) => ({
                    type: "context",
                    elements: [
                      {
                        type: "image",
                        image_url: passenger.user.image,
                        alt_text: passenger.user.name ?? passenger.user.email,
                      },
                      {
                        type: "plain_text",
                        emoji: true,
                        text: passenger.user.name ?? passenger.user.email,
                      },
                    ],
                  })),
                ]),
                { type: "divider" },
              ])
              .flat(),
          ]
        : []),
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  await notify.send(messageOfTheDay);

  response.status(200).json({
    ok: true,
  });
}
