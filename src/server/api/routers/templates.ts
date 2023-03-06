import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const templateRouter = createTRPCRouter({
  createCommuteTemplate: protectedProcedure
    .input(
      z.object({
        seats: z.number().min(1),
        stops: z.array(
          z.object({
            location: z.string(),
            time: z.string()?.nullish(),
          })
        ),
        comment: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const commute = await ctx.prisma.commuteTemplate.create({
        data: {
          createdById: ctx.session.user.id,
          stops: {
            create: input.stops.map((stop) => ({
              time: stop.time,
              locationId: stop.location,
            })),
          },
          seats: input.seats,
          comment: input.comment,
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
      const template = ctx.prisma.commuteTemplate.findFirst({
        where: {
          id: input.id,
          isDeleted: {
            equals: false,
          },
        },
        include: {
          stops: {
            select: {
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

      return template;
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
});
