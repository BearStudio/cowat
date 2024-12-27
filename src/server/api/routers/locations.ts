import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const locationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.create({
        data: {
          address: input.address,
          name: input.name,
          createdById: ctx.session.user.id,
        },
      });

      return location;
    }),
  mine: protectedProcedure.query(async ({ ctx }) => {
    const locations = await ctx.prisma.location.findMany({
      where: {
        createdById: ctx.session.user.id,
        isDeleted: false,
      },
    });

    return locations;
  }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.update({
        where: {
          id: input,
        },
        data: {
          isDeleted: true,
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
      const location = await ctx.prisma.location.findFirst({
        where: {
          id: input.id,
          isDeleted: {
            equals: false,
          },
        },
      });
      if (!location) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Location ${input.id} not found`,
        });
      }
      return location;
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        address: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.update({
        where: {
          id: input.id,
        },
        data: {
          address: input.address,
          name: input.name,
        },
      });
      return location;
    }),
});
