import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const stopRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    console.log({ stop: ctx.prisma.stop });

    const stops = ctx.prisma.stop.findMany();

    return stops;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
