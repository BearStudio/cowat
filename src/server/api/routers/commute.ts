import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { slack } from "@/server/slack";

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
                    name: "Darnétal",
                    address: "4 Impasse du Belvédère 76160 Darnétal",
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
});
