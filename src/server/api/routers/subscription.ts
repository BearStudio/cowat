import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Events } from "@prisma/client";

export const subscriptionRouter = createTRPCRouter({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.prisma.subscription.findMany({
      where: {
        createdById: ctx.session.user.id,
        isDeleted: false,
      },
    });

    return subscriptions;
  }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string(),
        url: z.string().url(),
        triggeringEvent: z.nativeEnum(Events),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const subscription = await ctx.prisma.subscription.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          url: input.url,
          triggeringEvent: input.triggeringEvent,
        },
      });

      return subscription;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        url: z.string().url(),
        triggeringEvent: z.nativeEnum(Events),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.subscription.create({
        data: {
          name: input.name,
          url: input.url,
          triggeringEvent: input.triggeringEvent,
          createdById: ctx.session.user.id,
        },
      });

      return subscription;
    }),

  delete: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.prisma.subscription.update({
        where: {
          id: input,
        },
        data: { isDeleted: true },
      });
      return subscription;
    }),
});
