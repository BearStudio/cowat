import { slack } from "@/server/slack";
import { isValidRequestStatusTransition } from "@/utils/requestStatus";
import { RequestStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const stopRouter = createTRPCRouter({
  book: protectedProcedure
    .input(
      z.object({
        stopId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let passengerOnStop;
      const doesExist = await ctx.prisma.passengersOnStops.findUnique({
        where: {
          userId_stopId: { stopId: input.stopId, userId: ctx.session.user.id },
        },
        include: {
          stop: {
            include: {
              commute: {
                select: {
                  createdBy: true,
                },
              },
            },
          },
        },
      });

      // If passenger on stop exists, then update the data
      if (doesExist) {
        passengerOnStop = await ctx.prisma.passengersOnStops.update({
          where: {
            userId_stopId: {
              stopId: input.stopId,
              userId: ctx.session.user.id,
            },
          },
          data: {
            requestStatus: "REQUESTED",
          },
          include: {
            stop: {
              include: {
                commute: {
                  include: {
                    createdBy: {
                      include: {
                        accounts: true,
                      },
                    },
                  },
                },
              },
            },
            user: {
              include: {
                accounts: true,
              },
            },
          },
        });
      } else {
        passengerOnStop = await ctx.prisma.passengersOnStops.create({
          data: {
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            stop: {
              connect: {
                id: input.stopId,
              },
            },
          },
          include: {
            stop: {
              include: {
                commute: {
                  include: {
                    createdBy: {
                      include: {
                        accounts: true,
                      },
                    },
                  },
                },
              },
            },
            user: {
              include: {
                accounts: true,
              },
            },
          },
        });
      }

      await slack.newBookingFrom(passengerOnStop);

      return passengerOnStop;
    }),
  requestStatus: protectedProcedure
    .input(
      z.object({
        stopId: z.string(),
        passengerId: z.string(),
        requestStatus: z.nativeEnum(RequestStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const passengerOnStop = await ctx.prisma.passengersOnStops.findUnique({
        where: {
          userId_stopId: { stopId: input.stopId, userId: input.passengerId },
        },
        include: {
          stop: {
            include: {
              commute: {
                select: {
                  createdBy: true,
                },
              },
            },
          },
        },
      });

      // If there is no passengers on stop matching those ids we can't update it.
      if (!passengerOnStop) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (
        !isValidRequestStatusTransition(
          passengerOnStop.requestStatus,
          input.requestStatus
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const passengerOnStopUpdated = await ctx.prisma.passengersOnStops.update({
        where: {
          userId_stopId: { stopId: input.stopId, userId: input.passengerId },
        },
        data: {
          requestStatus: input.requestStatus,
        },
        include: {
          stop: {
            include: {
              commute: {
                include: {
                  createdBy: {
                    include: {
                      accounts: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            include: {
              accounts: true,
            },
          },
        },
      });

      await slack.request(passengerOnStopUpdated);
    }),
});
