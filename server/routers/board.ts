import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { boardAndProjectSchema } from "@/types/schemas"
import { colorSchema } from "@/types/schemas"
import { boardSchema } from "@/types/schemas"

export const boardRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.findUnique({
        where: {
          id: input,
        },
        select: {
          name: true,
          color: true,
          id: true,
          projectId: true,
          lists: {
            include: {
              tasks: { include: { assigned_to: true } },
            },
          },
          project: { select: { owner: { select: { name: true } } } },
        },
      })
      return board
    }),
  getUsers: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          projects_in: { some: { userId: input } },
        },
      })
      return users
    }),
  create: protectedProcedure
    .input(boardAndProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.create({
        data: {
          name: input.name,
          projectId: input.projectId,
          order: 0,
        },
      })
      await ctx.prisma.board.updateMany({
        where: { NOT: { id: board.id } },
        data: { order: { increment: 1 } },
      })
      return board
    }),
  editColor: protectedProcedure
    .input(colorSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.update({
        where: { id: input.id },
        data: {
          color: input.color,
        },
      })
      return board
    }),
  editName: protectedProcedure
    .input(boardSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      })
      return board
    }),
  reorder: protectedProcedure
    .input(
      z.object({
        boardOneIndex: z.number(),
        boardTwoIndex: z.number(),
        draggableId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const boardDragged = await ctx.prisma.board.findUnique({
        where: { id: input.draggableId },
      })
      await ctx.prisma.board.update({
        where: { id: boardDragged?.id },
        data: { order: input.boardTwoIndex },
      })
      if (input.boardOneIndex > input.boardTwoIndex) {
        await ctx.prisma.board.updateMany({
          where: {
            AND: [
              { order: { gte: input.boardTwoIndex } },
              { order: { lte: input.boardOneIndex } },
              { NOT: { id: boardDragged?.id } },
            ],
          },
          data: { order: { increment: 1 } },
        })
      }

      if (input.boardOneIndex < input.boardTwoIndex) {
        await ctx.prisma.board.updateMany({
          where: {
            AND: [
              { order: { lte: input.boardTwoIndex } },
              { order: { gte: input.boardOneIndex } },
              { NOT: { id: boardDragged?.id } },
            ],
          },
          data: { order: { decrement: 1 } },
        })
      }

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.delete({
        where: { id: input },
      })
      return board
    }),
})
