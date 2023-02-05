import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { slack } from "@/server/slack";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { RequestStatus } from "@prisma/client";
import { groupBy } from "remeda";

export const commuteRouter = createTRPCRouter({
  createCommute: protectedProcedure
    .input(
      z.object({
        seats: z.number().min(1),
        date: z.date(),
        stops: z.array(
          z.object({
            location: z.string(),
            time: z.string()?.nullable(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commute = await ctx.prisma.commute.create({
        data: {
          seats: input.seats,
          date: input.date,
          createdById: ctx.session.user.id,
          stops: {
            create: input.stops.map((stop) => ({
              time: stop.time,
              locationId: stop.location,
            })),
          },
        },
        include: {
          createdBy: {
            select: {
              accounts: true,
              email: true,
            },
          },
          stops: {
            select: {
              location: true,
              time: true,
            },
          },
        },
      });

      await slack.newCommute(commute);

      return commute;
    }),
  myCommute: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        createdBy: true,
        stops: {
          include: {
            location: true,
            passengers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return commutes;
  }),
  communityCommutes: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        createdById: {
          not: ctx.session.user.id,
        },
        date: {
          gte: dayjs().subtract(1, "day").toDate(),
        },
      },
      include: {
        stops: {
          include: {
            location: true,
            passengers: {
              include: {
                user: true,
              },
            },
          },
        },
        createdBy: true,
      },
    });

    return commutes;
  }),
  commute: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const commute = ctx.prisma.commute.findFirstOrThrow({
        where: {
          id: input.id,
        },
        include: {
          stops: {
            include: {
              location: true,
              passengers: {
                include: {
                  user: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!commute) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return commute;
    }),
  todayCommutes: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        AND: [
          {
            date: {
              gt: dayjs().startOf("day").toDate(),
            },
          },
          {
            date: {
              lt: dayjs().endOf("day").toDate(),
            },
          },
        ],
      },
      include: {
        stops: {
          include: {
            location: true,
            passengers: {
              include: {
                user: true,
              },
            },
          },
        },
        createdBy: true,
      },
    });

    return commutes;
  }),
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        stops: {
          some: {
            passengers: {
              some: {
                userId: ctx.session.user.id,
                requestStatus: {
                  notIn: ["CANCELED", "REFUSED"],
                },
              },
            },
          },
        },
      },
      include: {
        stops: {
          include: {
            location: true,
            passengers: {
              include: {
                user: true,
              },
            },
          },
        },
        createdBy: true,
      },
    });

    return commutes;
  }),
  allRequestsForMyCommute: protectedProcedure.query(async ({ ctx }) => {
    const requests = ctx.prisma.passengersOnStops.findMany({
      where: {
        stop: {
          commute: {
            createdById: ctx.session.user.id,
            date: {
              gte: new Date(),
            },
          },
        },
        requestStatus: {
          equals: RequestStatus.REQUESTED,
        },
      },
      include: {
        stop: {
          include: {
            commute: true,
            location: true,
          },
        },
        user: true,
      },
    });

    return requests;
  }),
  allUpcomingCommutes: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        date: {
          gte: dayjs().startOf("day").toDate(),
          lte: dayjs().add(7, "days").endOf("day").toDate(),
        },
      },
      include: {
        createdBy: true,
        stops: {
          include: { location: true, passengers: { include: { user: true } } },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return groupBy(commutes, (commute) =>
      dayjs(commute.date).format("YYYY-MM-DD")
    );
  }),
});
