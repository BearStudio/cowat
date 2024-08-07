import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Events } from "@prisma/client";

export const subscriptionRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.prisma.subscription.findMany();

    return subscriptions;
  }),

  create: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        triggeringEvent: z.nativeEnum(Events),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const subscription = await ctx.prisma.subscription.create({
        data: {
          endpoint: input.endpoint,
          triggeringEvent: input.triggeringEvent,
          userId: ctx.session.user.id,
        },
      });

      return subscription;
    }),

  // getAllSubscriptionsByEvent: protectedProcedure
  //   .input(
  //     z.object({
  //       triggeringEvent: z.nativeEnum(Events),
  //     })
  //   )
  //   .query(async ({ input, ctx }) => {
  //     const subscriptions = await ctx.prisma.subscription.findMany({
  //       where: {
  //         triggeringEvent: input.triggeringEvent,
  //       },
  //     });

  //     return subscriptions;
  //   }),
});
