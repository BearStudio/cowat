import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { Events } from "@prisma/client";

export const subscriptionRouter = createTRPCRouter({
  mine: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.prisma.subscription.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return subscriptions;
  }),

  edit: protectedProcedure
    .input(
      z.object({
        subscriptions: z.array(
          z.object({
            id: z.string().cuid().nullable(),
            name: z.string(),
            url: z.string().url(),
            triggeringEvent: z.nativeEnum(Events),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentSubscriptions = await ctx.prisma.subscription.findMany({
        where: { userId: ctx.session.user.id },
      });

      const inputSubscriptionIds = input.subscriptions.map(
        (subscription) => subscription.id
      );

      const subscriptionsToDeleteIds = currentSubscriptions
        .filter(
          (subscription) => !inputSubscriptionIds.includes(subscription.id)
        )
        .map((subscription) => subscription.id);

      await ctx.prisma.subscription.deleteMany({
        where: {
          id: {
            in: subscriptionsToDeleteIds,
          },
        },
      });

      return await ctx.prisma.$transaction(
        input.subscriptions.map((subscriptionToCreateOrModify) =>
          ctx.prisma.subscription.upsert({
            where: {
              id: subscriptionToCreateOrModify.id ?? "",
              userId: ctx.session.user.id,
            },
            update: {
              name: subscriptionToCreateOrModify.name,
              url: subscriptionToCreateOrModify.url,
              triggeringEvent: subscriptionToCreateOrModify.triggeringEvent,
            },
            create: {
              name: subscriptionToCreateOrModify.name,
              url: subscriptionToCreateOrModify.url,
              triggeringEvent: subscriptionToCreateOrModify.triggeringEvent,
              userId: ctx.session.user.id,
            },
          })
        )
      );
    }),
});
