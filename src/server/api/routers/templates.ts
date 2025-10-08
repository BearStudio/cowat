import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";

import { z } from "zod";

export const templateRouter = createTRPCRouter({
  createCommuteTemplate: protectedProcedure
    .input(
      z.object({
        seats: z.number().min(1),
        stops: z
          .array(
            z.object({
              location: z.string(),
              time: z.string(),
            })
          )
          .nullish(),
        commuteType: z.enum(["ROUND", "ONEWAY"]),
        comment: z.string().nullish(),
        templateName: z.string().nullish(),
        outwardTime: z.string().nullish(),
        returnTime: z.string().nullish(),
        outwardLocation: z.string().nullish(),
        returnLocation: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commute = await ctx.prisma.commuteTemplate.create({
        data: {
          createdById: ctx.session.user.id,
          stops: {
            create: [
              ...(input.outwardLocation && input.outwardTime
                ? [
                    {
                      time: input.outwardTime,
                      locationId: input.outwardLocation,
                    },
                  ]
                : []),
              ...(input.returnLocation && input.returnTime
                ? [
                    {
                      time: input.returnTime,
                      locationId: input.returnLocation,
                    },
                  ]
                : []),
              ...(input.stops?.map((stop) => ({
                time: stop.time,
                locationId: stop.location,
              })) ?? []),
            ],
          },
          templateName: input.templateName,
          seats: input.seats,
          commuteType: input.commuteType,
          comment: input.comment,
          outwardTime: input.outwardTime
            ? dayjs(input.outwardTime, "HH:mm").toDate()
            : null,
          returnTime: input.returnTime
            ? dayjs(input.returnTime, "HH:mm").toDate()
            : null,
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
  myCommuteTemplates: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.commuteTemplate.findMany({
      where: {
        createdById: ctx.session.user.id,
        isDeleted: {
          equals: false,
        },
      },
      include: {
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
  }),
  get: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const template = await ctx.prisma.commuteTemplate.findFirst({
        where: {
          id: input.id,
          isDeleted: {
            equals: false,
          },
        },
        include: {
          stops: {
            orderBy: {
              time: "asc",
            },
            select: {
              id: true,
              locationId: true,
              location: true,
              time: true,
            },
          },
        },
      });

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Template ${input.id} not found`,
        });
      }

      const allStops = template.stops;
      const outwardStop = ["ONEWAY", "ROUND"].includes(template.commuteType)
        ? allStops[0]
        : null;
      const returnStop =
        template.commuteType === "ROUND" ? allStops.at(-1) : null;
      const intermediateStops = allStops.filter(
        (stop) => stop !== outwardStop && stop !== returnStop
      );

      return {
        ...template,
        outwardLocation: outwardStop?.locationId,
        outwardTime: outwardStop?.time,
        returnLocation: returnStop?.locationId,
        returnTime: returnStop?.time,
        stops: intermediateStops.map((stops) => ({
          id: stops.id,
          location: stops.location,
          time: stops.time,
        })),
      };
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.commuteTemplate.update({
        where: {
          id: input.id,
        },
        data: {
          isDeleted: true,
        },
      });
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        seats: z.number().min(1),
        stops: z
          .array(
            z.object({
              location: z.string(),
              time: z.string(),
            })
          )
          .nullish(),
        commuteType: z.enum(["ROUND", "ONEWAY"]),
        comment: z.string().nullish(),
        templateName: z.string().nullish(),
        outwardTime: z.string().nullish(),
        returnTime: z.string().nullish(),
        outwardLocation: z.string().nullish(),
        returnLocation: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Deleting all the stops so we can recreate them
      // This is a quick win, we should probably do it another way like update
      await ctx.prisma.stop.deleteMany({
        where: {
          commuteTemplateId: input.id,
        },
      });

      const commute = await ctx.prisma.commuteTemplate.update({
        data: {
          createdById: ctx.session.user.id,
          stops: {
            create: [
              ...(input.outwardLocation && input.outwardTime
                ? [
                    {
                      time: input.outwardTime,
                      locationId: input.outwardLocation,
                    },
                  ]
                : []),
              ...(input.stops?.map((stop) => ({
                time: stop.time,
                locationId: stop.location,
              })) ?? []),
              ...(input.returnLocation && input.returnTime
                ? [{ time: input.returnTime, locationId: input.returnLocation }]
                : []),
            ],
          },
          templateName: input.templateName,
          seats: input.seats,
          commuteType: input.commuteType,
          comment: input.comment,
          outwardTime: input.outwardTime
            ? dayjs(input.outwardTime, "HH:mm").toDate()
            : null,
          returnTime: input.returnTime
            ? dayjs(input.returnTime, "HH:mm").toDate()
            : null,
        },
        where: {
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
