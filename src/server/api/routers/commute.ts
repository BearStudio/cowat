import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { slack } from "@/server/slack";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { RequestStatus } from "@prisma/client";
import { groupBy } from "remeda";
import { ONLY_TIME, YEAR_MONTH_DAY } from "@/constants/dates";

dayjs.extend(utc);

export const commuteRouter = createTRPCRouter({
  createCommute: protectedProcedure
    .input(
      z.object({
        seats: z.number().min(1),
        date: z.date(),
        departureTime: z.date().nullish(),
        returnTime: z.date().nullish(),
        departureLocation: z.string().nullish(),
        returnLocation: z.string().nullish(),
        stops: z.array(
          z.object({
            location: z.string(),
            time: z.string(),
          })
        ),
        comment: z.string().nullish(),
        commuteType: z.enum(["ROUND", "OUTBOUND", "RETURN"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commute = await ctx.prisma.commute.create({
        data: {
          seats: input.seats,
          date: input.date,
          departureTime: input.departureTime,
          returnTime: input.returnTime,
          createdById: ctx.session.user.id,
          stops: {
            create: [
              ...(input.departureLocation
                ? [
                    {
                      time: dayjs(input.departureTime).format(ONLY_TIME),
                      locationId: input.departureLocation,
                    },
                  ]
                : []),
              ...(input.commuteType !== "OUTBOUND" &&
              input.returnLocation &&
              input.returnTime
                ? [
                    {
                      time: dayjs(input.returnTime).format(ONLY_TIME),
                      locationId: input.returnLocation,
                    },
                  ]
                : []),
              ...input.stops.map((stop) => ({
                time: stop.time,
                locationId: stop.location,
              })),
            ],
          },
          comment: input.comment,
          commuteType: input.commuteType,
        },
        include: {
          createdBy: {
            select: {
              slackMemberId: true,
              email: true,
            },
          },
          stops: {
            orderBy: {
              time: "asc",
            },
            select: {
              id: true,
              location: true,
              time: true,
            },
          },
        },
      });

      try {
        await slack.newCommute(commute);
      } catch {
        console.error("Can't send the Slack notification");
      }

      return commute;
    }),
  allMyCommutes: protectedProcedure.query(async ({ ctx }) => {
    const commutes = await ctx.prisma.commute.findMany({
      where: {
        OR: [
          {
            createdById: {
              equals: ctx.session.user.id,
            },
          },
          {
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
        ],
        AND: [
          {
            date: {
              gte: dayjs().subtract(1, "day").toDate(),
            },
          },
        ],
      },
      orderBy: {
        date: "asc",
      },
      include: {
        stops: {
          orderBy: {
            time: "asc",
          },
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
  allMyCommutesOnDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const targetDate = dayjs.utc(input.date).toDate();
      const nextDay = dayjs.utc(input.date).add(1, "day").toDate();
      const commutes = await ctx.prisma.commute.findMany({
        where: {
          AND: [
            {
              date: {
                gte: targetDate,
                lt: nextDay,
              },
              isDeleted: false,
            },
            {
              OR: [
                {
                  createdById: {
                    equals: ctx.session.user.id,
                  },
                },
                {
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
              ],
            },
          ],
        },
        orderBy: {
          date: "asc",
        },
        include: {
          stops: {
            orderBy: {
              time: "asc",
            },
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
            isDeleted: {
              equals: false,
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
    const NUMBER_OF_DAYS = 14;

    const commutes = await ctx.prisma.commute.findMany({
      where: {
        isDeleted: false,
        OR: [
          {
            date: {
              gte: dayjs().toDate(),
              lte: dayjs().add(NUMBER_OF_DAYS, "days").endOf("day").toDate(),
            },
          },
          {
            AND: [
              {
                date: {
                  gte: dayjs().startOf("day").toDate(),
                  lte: dayjs().add(7, "days").endOf("day").toDate(),
                },
              },
              {
                OR: [
                  {
                    createdById: ctx.session.user.id,
                  },
                  {
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
                ],
              },
            ],
          },
        ],
      },
      include: {
        createdBy: true,
        stops: {
          orderBy: {
            time: "asc",
          },
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
      orderBy: {
        date: "asc",
      },
    });

    return {
      commutes: groupBy(commutes, (commute) =>
        dayjs(commute.date).format(YEAR_MONTH_DAY)
      ),
      numberOfDays: NUMBER_OF_DAYS,
    };
  }),
  cancelCommute: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const commute = await ctx.prisma.commute.update({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        data: {
          isDeleted: true,
        },
        include: {
          stops: {
            include: {
              passengers: {
                include: {
                  stop: {
                    include: {
                      commute: {
                        include: {
                          createdBy: {
                            include: {
                              accounts: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  user: {
                    include: {
                      accounts: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      commute?.stops
        ?.flatMap((stop) => stop.passengers)
        .filter(
          (passenger) =>
            passenger.requestStatus === "ACCEPTED" ||
            passenger.requestStatus === "REQUESTED"
        )
        .map(async (passenger) => await slack.commuteCanceled(passenger));
    }),
  commuteById: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.commute.findFirstOrThrow({
        where: {
          id: input.id,
          isDeleted: false,
          OR: [
            {
              createdById: ctx.session.user.id,
            },
            {
              stops: {
                some: {
                  passengers: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          createdBy: {
            select: {
              name: true,
              image: true,
            },
          },
          stops: {
            orderBy: {
              time: "asc",
            },
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
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        date: z.date(),
        departureTime: z.date(),
        returnTime: z.date(),
        seats: z.number().min(1),
        stops: z
          .array(
            z.object({
              location: z.string(),
              time: z.string(),
              id: z.string().nullish(),
            })
          )
          .nullish(),
        comment: z.string().nullish(),
        commuteType: z.enum(["ROUND", "OUTBOUND", "RETURN"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.stops) {
        const existingStops = await ctx.prisma.stop.findMany({
          where: {
            commuteId: input.id,
          },
        });

        const inputStops = input.stops.map((stop) => ({
          id: stop.id ?? "0",
          locationId: stop.location,
          time: stop.time,
          commuteId: input.id,
        }));

        const inputStopsIds = inputStops.map((stop) => stop.id);

        const stopsToDeleteIds = existingStops
          .filter((stop) => !inputStopsIds?.includes(stop.id))
          .map((stop) => stop.id);

        const stopsToCreateOrModify = inputStops.filter(
          (stop) => !stopsToDeleteIds.includes(stop.id)
        );

        await ctx.prisma.$transaction(
          stopsToCreateOrModify.map((stopToCreateOrModify) =>
            ctx.prisma.stop.upsert({
              update: {
                time: stopToCreateOrModify.time,
                locationId: stopToCreateOrModify.locationId,
              },
              create: {
                time: stopToCreateOrModify.time,
                locationId: stopToCreateOrModify.locationId,
                commuteId: stopToCreateOrModify.commuteId,
              },
              where: {
                id: stopToCreateOrModify.id,
              },
            })
          )
        );

        await ctx.prisma.stop.deleteMany({
          where: {
            id: {
              in: stopsToDeleteIds,
            },
          },
        });
      }

      const updatedStops = await ctx.prisma.stop.findMany({
        where: {
          commuteId: input.id,
        },
        orderBy: {
          time: "asc",
        },
      });

      const currentCommute = await ctx.prisma.commute.findUnique({
        where: {
          id: input.id,
        },
      });

      const commute = await ctx.prisma.commute.update({
        data: {
          seats: input.seats,
          comment: input.comment,
          date: input.date,
          departureTime: input.departureTime,
          returnTime: input.returnTime,
          commuteType: input.commuteType,
        },
        where: {
          createdById: ctx.session.user.id,
          id: input.id,
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

      return commute;
    }),
});
