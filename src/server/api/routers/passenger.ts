import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { StopStatus } from "@prisma/client";
import { z } from "zod";

export const passengerRouter = createTRPCRouter({
  hereOnStop: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        tripType: z.enum(["ROUND", "OUTBOUND", "RETURN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const commute = ctx.prisma.passengersOnStops.update({
        where: {
          userId_stopId: {
            stopId: input.id,
            userId: ctx.session.user.id,
          },
        },
        data: {
          stopStatus: StopStatus.ON_TIME,
          delay: null,
          tripType: input.tripType,
        },
      });

      return commute;
    }),
  iAmLate: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        delay: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const commute = ctx.prisma.passengersOnStops.update({
        where: {
          userId_stopId: {
            stopId: input.id,
            userId: ctx.session.user.id,
          },
        },
        data: {
          stopStatus: StopStatus.DELAYED,
          delay: input.delay,
        },
      });

      return commute;
    }),
});
