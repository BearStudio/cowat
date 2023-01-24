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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commute = await ctx.prisma.commute.create({
        data: {
          seats: input.seats,
          date: input.date,
          createdById: ctx.session.user.id,
          stops: {
            create: [
              {
                location: {
                  create: {
                    name: "Rouen",
                    address: "Mairie de Rouen",
                  },
                },
              },
              {
                location: {
                  create: {
                    name: "Saint André",
                    address:
                      "1900 Route de Cailly 76690 Saint André sur Cailly",
                  },
                },
              },
            ],
          },
        },
        include: {
          createdBy: {
            select: {
              slackUserId: true,
              email: true,
            },
          },
        },
      });

      const createdBy = commute.createdBy?.slackUserId
        ? `<@${commute.createdBy?.slackUserId}>`
        : commute.createdBy?.email;

      await slack.send({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `A new commute has been created by ${createdBy} @here`,
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "Check",
                emoji: true,
              },
              value: "click_me_123",
              url: "http://localhost:3000/commutes",
              action_id: "button-action",
            },
          },
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
});
