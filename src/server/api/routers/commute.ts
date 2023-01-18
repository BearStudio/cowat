import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

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
          stopsOnCommutes: {
            create: [
              {
                stop: {
                  create: {
                    location: {
                      create: {
                        name: "Darnétal",
                        address: "4 Impasse du Belvédère 76160 Darnétal",
                      },
                    },
                  },
                },
              },
              {
                stop: {
                  create: {
                    location: {
                      create: {
                        name: "Saint André",
                        address:
                          "1900 Route de Cailly 76690 Saint André sur Cailly",
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      });

      return commute;
    }),
  myCommute: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        stopsOnCommutes: {
          select: {
            stop: {
              select: {
                location: true,
              },
            },
          },
        },
        passengersOnStopsOnCommutes: {
          select: {
            user: true,
          },
        },
      },
    });

    return commutes;
  }),
});
