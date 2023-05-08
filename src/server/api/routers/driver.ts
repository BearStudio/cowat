import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const driverRouter = createTRPCRouter({
  iAmLate: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        delay: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const commute = ctx.prisma.commute.update({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          status: "DELAYED",
          delay: input.delay,
        },
      });

      return commute;
    }),
  onTime: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const commute = ctx.prisma.commute.update({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          status: "ON_TIME",
          // Reset delay when onTime is called after iAmLate
          delay: null,
        },
      });

      return commute;
    }),
  hereOnStop: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const commute = ctx.prisma.stop.update({
        where: {
          id: input.id,
        },
        data: {
          driverStatus: "HERE",
        },
      });

      return commute;
    }),
});
