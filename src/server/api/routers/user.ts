import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        phone: z.string().nullish(),
        slackMemberId: z.string(),
        autoAccept: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          phone: input.phone,
          slackMemberId: input.slackMemberId,
          autoAccept: input.autoAccept,
        },
      });

      return user;
    }),
  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: {
          equals: ctx.session.user.id,
        },
      },
    });
  }),
});
