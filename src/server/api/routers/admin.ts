import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const numberOfCommutesTotal = await ctx.prisma.commute.count();
    const numberOfCommutePerUsers = await ctx.prisma.user.findMany({
      include: {
        _count: {
          select: { commutes: true },
        },
      },
    });

    return {
      numberOfCommutesTotal,
      numberOfCommutePerUsers,
    };
  }),
});
