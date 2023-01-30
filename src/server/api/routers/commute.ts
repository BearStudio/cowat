import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { slack } from "@/server/slack";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";

export const commuteRouter = createTRPCRouter({
  createCommute: protectedProcedure
    .input(
      z.object({
        seats: z.number().min(1),
        date: z.date(),
        stops: z.array(
          z.object({
            location: z.string(),
            time: z.string()?.nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commute = await ctx.prisma.commute.create({
        data: {
          seats: input.seats,
          date: input.date,
          createdById: ctx.session.user.id,
          stops: {
            create: input.stops.map((stop) => ({
              time: stop.time,
              locationId: stop.location,
            })),
          },
        },
        include: {
          createdBy: {
            select: {
              accounts: true,
              email: true,
            },
          },
          stops: {
            select: {
              location: true,
              time: true,
            },
          },
        },
      });

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
        //     text: "Choose",
        //   },
        //   value: "chekc",
        //   url: `${env.NEXTAUTH_URL}/commutes`,
        // },
      }));

      await slack.send({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              // text: `A new commute has been created by ${createdBy} @here`,
              text: `A new commute has been created by ${createdBy} (💺 ${commute.seats} seats available)`,
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
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      return commute;
    }),
  myCommute: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        createdBy: true,
        stops: {
          include: {
            location: true,
            passengers: true,
          },
        },
      },
    });

    return commutes;
  }),
  communityCommutes: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        createdById: {
          not: ctx.session.user.id,
        },
        date: {
          gte: dayjs().subtract(1, "day").toDate(),
        },
      },
      include: {
        stops: {
          include: {
            location: true,
            passengers: true,
          },
        },
        createdBy: true,
      },
    });

    return commutes;
  }),
  commute: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const commute = ctx.prisma.commute.findFirstOrThrow({
        where: {
          id: input.id,
        },
        include: {
          stops: {
            include: {
              location: true,
              passengers: {
                include: {
                  user: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!commute) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return commute;
    }),
  todayCommutes: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        AND: [
          {
            date: {
              gt: dayjs().startOf("day").toDate(),
            },
          },
          {
            date: {
              lt: dayjs().endOf("day").toDate(),
            },
          },
        ],
      },
      include: {
        stops: {
          include: {
            location: true,
            passengers: true,
          },
        },
        createdBy: true,
      },
    });

    return commutes;
  }),
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        stops: {
          some: {
            passengers: {
              some: {
                userId: ctx.session.user.id,
                requestStatus: {
                  notIn: ["CANCELED", "REFUSED"],
                },
              },
            },
          },
        },
      },
      include: {
        stops: {
          include: {
            location: true,
            passengers: true,
          },
        },
        createdBy: true,
      },
    });

    return commutes;
  }),
});
