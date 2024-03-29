import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { boardAndProjectSchema, reorderSchema } from "@/utils/schemas"
import { colorSchema } from "@/utils/schemas"
import { boardSchema } from "@/utils/schemas"

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
          projects_in: {
            some: { project: { boards: { some: { id: input } } } },
          },
        },
      })

      return users
    }),
  create: protectedProcedure
    .input(boardAndProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        include: { users: true },
      })

      if (!project) {
        throw new Error("Project does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const board = await ctx.prisma.board.create({
        data: {
          name: input.name,
          projectId: input.projectId,
          order: 0,
        },
      })

      await ctx.prisma.board.updateMany({
        where: {
          AND: [{ NOT: { id: board.id } }, { projectId: input.projectId }],
        },
        data: { order: { increment: 1 } },
      })

      return board
    }),
  editColor: protectedProcedure
    .input(colorSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.findUnique({
        where: { id: input.id },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: board?.projectId },
        include: { users: true },
      })

      if (!board || !project) {
        throw new Error("Project or board does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const updatedBoard = await ctx.prisma.board.update({
        where: { id: board.id },
        data: {
          color: input.color,
        },
      })
      return updatedBoard
    }),
  editName: protectedProcedure
    .input(boardSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.findUnique({
        where: { id: input.id },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: board?.projectId },
        include: { users: true },
      })

      if (!board || !project) {
        throw new Error("Project or board does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const updatedBoard = await ctx.prisma.board.update({
        where: { id: board.id },
        data: {
          name: input.name,
        },
      })

      return updatedBoard
    }),
  reorder: protectedProcedure
    .input(reorderSchema)
    .mutation(async ({ ctx, input }) => {
      const boardDragged = await ctx.prisma.board.findUnique({
        where: { id: input.draggableId },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: boardDragged?.projectId },
        include: { users: true },
      })

      if (!boardDragged || !project) {
        throw new Error("Project or board does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      await ctx.prisma.board.update({
        where: { id: boardDragged.id },
        data: { order: input.itemTwoIndex },
      })

      if (input.itemOneIndex > input.itemTwoIndex) {
        await ctx.prisma.board.updateMany({
          where: {
            AND: [
              { order: { gte: input.itemTwoIndex } },
              { order: { lte: input.itemOneIndex } },
              { NOT: { id: boardDragged.id } },
              { projectId: boardDragged.projectId },
            ],
          },
          data: { order: { increment: 1 } },
        })
      }

      if (input.itemOneIndex < input.itemTwoIndex) {
        await ctx.prisma.board.updateMany({
          where: {
            AND: [
              { order: { lte: input.itemTwoIndex } },
              { order: { gte: input.itemOneIndex } },
              { NOT: { id: boardDragged.id } },
              { projectId: boardDragged.projectId },
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
      const board = await ctx.prisma.board.findUnique({
        where: { id: input },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: board?.projectId },
        include: { users: true },
      })

      if (!board || !project) {
        throw new Error("Project or board does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const lists = await ctx.prisma.list.findMany({
        where: { boardId: board.id },
      })

      for (let list of lists) {
        const tasks = await ctx.prisma.task.findMany({
          where: { listId: list.id },
        })
        for (let task of tasks) {
          const users = await ctx.prisma.user.findMany({
            where: { tasks: { some: { id: task.id } } },
          })
          await ctx.prisma.task.update({
            where: { id: task.id },
            data: {
              assigned_to: { disconnect: users.map((u) => ({ id: u.id })) },
            },
          })
        }
      }

      await ctx.prisma.board.delete({
        where: { id: board.id },
      })

      await ctx.prisma.board.updateMany({
        where: {
          AND: [{ order: { gt: board.order } }, { projectId: board.projectId }],
        },
        data: { order: { decrement: 1 } },
      })

      return { success: true }
    }),
})
