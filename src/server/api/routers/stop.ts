import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const stopRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const stops = await ctx.prisma.stop.findMany();

    return stops;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
