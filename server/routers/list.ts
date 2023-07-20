import { z } from "zod"
import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc"
import { colorSchema, reorderSchema } from "@/utils/schemas"
import { listSchema } from "@/utils/schemas"
import { editListSchema } from "@/utils/schemas"

export const listRouter = createTRPCRouter({
  getByBoard: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const lists = await ctx.prisma.list.findMany({
        where: { boardId: input },
        orderBy: { order: "asc" },
        include: {
          tasks: { include: { assigned_to: true }, orderBy: { order: "asc" } },
        },
      })

      return lists
    }),
  create: protectedProcedure
    .input(listSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.findUnique({
        where: { id: input.boardId },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: board?.projectId },
        include: { users: true },
      })

      if (!project || !board) {
        throw new Error("Project or board does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const listsLength = await ctx.prisma.list.count({
        where: { boardId: input.boardId },
      })

      const list = await ctx.prisma.list.create({
        data: {
          name: input.name,
          boardId: input.boardId,
          order: listsLength,
        },
      })

      return list
    }),
  editName: protectedProcedure
    .input(editListSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.id },
        include: { board: true },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: list?.board.projectId },
        include: { users: true },
      })

      if (!project || !list) {
        throw new Error("Project or list does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const updatedList = await ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      })

      return updatedList
    }),
  editColor: protectedProcedure
    .input(colorSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.id },
        include: { board: true },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: list?.board.projectId },
        include: { users: true },
      })

      if (!project || !list) {
        throw new Error("Project or list does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const updatedList = await ctx.prisma.list.update({
        where: { id: list.id },
        data: {
          color: input.color,
        },
      })

      return updatedList
    }),
  reorder: protectedProcedure
    .input(reorderSchema)
    .mutation(async ({ ctx, input }) => {
      const listDragged = await ctx.prisma.list.findUnique({
        where: { id: input.draggableId },
        include: { board: true },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: listDragged?.board.projectId },
        include: { users: true },
      })

      if (!project || !listDragged) {
        throw new Error("Project or list does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      await ctx.prisma.list.update({
        where: { id: listDragged.id },
        data: { order: input.itemTwoIndex },
      })

      if (input.itemOneIndex > input.itemTwoIndex) {
        await ctx.prisma.list.updateMany({
          where: {
            AND: [
              { order: { gte: input.itemTwoIndex } },
              { order: { lte: input.itemOneIndex } },
              { NOT: { id: listDragged.id } },
              { boardId: listDragged.boardId },
            ],
          },
          data: { order: { increment: 1 } },
        })
      }

      if (input.itemOneIndex < input.itemTwoIndex) {
        await ctx.prisma.list.updateMany({
          where: {
            AND: [
              { order: { lte: input.itemTwoIndex } },
              { order: { gte: input.itemOneIndex } },
              { NOT: { id: listDragged.id } },
              { boardId: listDragged.boardId },
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
      const list = await ctx.prisma.list.findUnique({
        where: { id: input },
        include: { board: true, tasks: true },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: list?.board.projectId },
        include: { users: true },
      })

      if (!project || !list) {
        throw new Error("Project or list does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

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

      await ctx.prisma.list.delete({
        where: { id: list.id },
      })

      await ctx.prisma.list.updateMany({
        where: { AND: [{ order: { gt: list.order }, boardId: list.board.id }] },
        data: { order: { decrement: 1 } },
      })

      return { success: true }
    }),
})
