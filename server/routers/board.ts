import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardAndProjectSchema } from "@/components/Project"
import { colorSchema } from "@/components/ColorPicker"
import { boardSchema } from "@/components/Boards"

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
          lists: { include: { tasks: true } },
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
          projects_in: { some: { boards: { some: { id: input } } } },
        },
      })
      return users
    }),
  create: protectedProcedure
    .input(boardAndProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.create({
        data: input,
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
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.delete({
        where: { id: input },
      })
      return board
    }),
})
