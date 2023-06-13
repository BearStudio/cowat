import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { User } from "@prisma/client";

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const numberOfCommutesTotal = await ctx.prisma.commute.count({
      where: {
        isDeleted: false,
      },
    });

    const numberOfCommuteAsDriverPerUsers = await ctx.prisma.user.findMany({
      include: {
        _count: {
          select: {
            commutes: {
              where: {
                isDeleted: {
                  equals: false,
                },
              },
            },
          },
        },
      },
    });

    const numberOfCommuteAsPassengerPerUsers: Array<
      Pick<User, "id" | "name" | "email" | "image"> & { countPassenger: number }
    > = await ctx.prisma.$queryRaw`SELECT
        User.id,
        User.name,
        User.email,
        User.image,
        Aggr.countPassenger
      FROM User
      LEFT JOIN
        (
          SELECT PassengersOnStops.userId,
          COUNT(*) AS countPassenger
          FROM PassengersOnStops
          WHERE PassengersOnStops.requestStatus = "ACCEPTED"
          GROUP BY PassengersOnStops.userId
        ) 
      AS Aggr
      ON (User.id = Aggr.userId)
    `;

    return {
      numberOfCommutesTotal,
      numberOfCommuteAsDriverPerUsers,
      numberOfCommuteAsPassengerPerUsers,
    };
  }),
});
