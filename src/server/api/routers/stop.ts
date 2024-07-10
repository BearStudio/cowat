import { slack } from "@/server/slack";
import { getPassengers } from "@/utils/commutes";
import { isValidRequestStatusTransition } from "@/utils/requestStatus";
import type { PrismaClient, User } from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const bookInput = z.object({
  stopId: z.string(),
});

export async function book({
  userId,
  input,
  prisma,
}: {
  userId: User["id"];
  input: z.infer<typeof bookInput>;
  prisma: PrismaClient;
}) {
  const relatedCommute = await prisma.stop.findFirst({
    where: {
      id: input.stopId,
    },
    include: {
      commute: {
        include: {
          stops: {
            include: {
              passengers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const passengers = getPassengers(relatedCommute?.commute?.stops ?? []);

  const stopCreatorId = relatedCommute?.commute?.createdById;

  // The commute is deleted / canceled
  if (relatedCommute?.commute?.isDeleted) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "This commute doesn't exists (anymore)",
    });
  }

  // Checking if the commute is complete
  if (relatedCommute?.commute?.seats === passengers.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This commute is complete, booking aren't allowed anymore",
    });
  }

  // The driver can't book their own commute
  if (stopCreatorId === userId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You can't book your own commute",
    });
  }

  // The user can't book the same commute twice
  if (!!passengers?.find((passenger) => passenger.userId === userId)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You can't book the same commute twice",
    });
  }

  let passengerOnStop;
  const doesExist = await prisma.passengersOnStops.findUnique({
    where: {
      userId_stopId: { stopId: input.stopId, userId },
    },
    include: {
      stop: {
        include: {
          commute: true,
        },
      },
    },
  });

  const { isAutoAcceptEnabled } =
    (await prisma.user.findUnique({
      where: {
        id: stopCreatorId,
      },
    })) ?? {};
  const requestStatus =
    isAutoAcceptEnabled && !doesExist ? "ACCEPTED" : "REQUESTED";

  // If passenger on stop exists, then update the data. If it exist it means the
  // user did cancel the request.
  if (doesExist) {
    passengerOnStop = await prisma.passengersOnStops.update({
      where: {
        userId_stopId: {
          stopId: input.stopId,
          userId,
        },
      },
      data: {
        requestStatus: requestStatus,
      },
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
    });
  } else {
    passengerOnStop = await prisma.passengersOnStops.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        stop: {
          connect: {
            id: input.stopId,
          },
        },
        requestStatus: requestStatus,
      },
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
    });
  }

  await slack.newBookingFrom(passengerOnStop);
  if (requestStatus === "ACCEPTED") {
    await slack.bookingAutoAccepted(passengerOnStop);
  }

  return passengerOnStop;
}

export const stopRouter = createTRPCRouter({
  book: protectedProcedure.input(bookInput).mutation(({ ctx, input }) => {
    return book({ userId: ctx.session.user.id, prisma: ctx.prisma, input });
  }),
  requestStatus: protectedProcedure
    .input(
      z.object({
        stopId: z.string(),
        passengerId: z.string(),
        requestStatus: z.nativeEnum(RequestStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const passengerOnStop = await ctx.prisma.passengersOnStops.findUnique({
        where: {
          userId_stopId: { stopId: input.stopId, userId: input.passengerId },
        },
        include: {
          stop: {
            include: {
              commute: {
                select: {
                  createdBy: true,
                },
              },
            },
          },
        },
      });

      // If there is no passengers on stop matching those ids we can't update it.
      if (!passengerOnStop) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (
        !isValidRequestStatusTransition(
          passengerOnStop.requestStatus,
          input.requestStatus
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const passengerOnStopUpdated = await ctx.prisma.passengersOnStops.update({
        where: {
          userId_stopId: { stopId: input.stopId, userId: input.passengerId },
        },
        data: {
          requestStatus: input.requestStatus,
        },
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
      });

      if (input.requestStatus === "CANCELED") {
        await slack.bookingCanceled(passengerOnStopUpdated);
      }

      if (
        input.requestStatus === "ACCEPTED" ||
        input.requestStatus === "REFUSED"
      ) {
        await slack.request(passengerOnStopUpdated);
      }
    }),
});
