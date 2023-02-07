import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          phone: input.phone,
        },
      });

      return user;
    }),
});
