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
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const locations = await ctx.prisma.location.findMany();

    return locations;
  }),
  mine: protectedProcedure.query(async ({ ctx }) => {
    const locations = await ctx.prisma.location.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
    });

    return locations;
  }),
  others: protectedProcedure.query(async ({ ctx }) => {
    const locations = await ctx.prisma.location.findMany({
      where: {
        createdById: {
          not: ctx.session.user.id,
        },
      },
    });

    return locations;
  }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const location = await ctx.prisma.location.findFirst({
        where: {
          id: input,
        },
      });

      if (!location) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (location.createdById !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return ctx.prisma.location.delete({
        where: {
          id: input,
        },
      });
    }),
});
