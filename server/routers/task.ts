import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { colorSchema, taskSchema } from "@/utils/schemas"
import { editTaskSchema } from "@/utils/schemas"

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(taskSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
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

      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.assigned_to },
        },
      })

      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          order: 0,
          assigned_to: { connect: users.map((user) => ({ id: user.id })) },
        },
      })

      await ctx.prisma.task.updateMany({
        where: {
          AND: [{ listId: input.listId }, { id: { not: task.id } }],
        },
        data: {
          order: { increment: 1 },
        },
      })

      return task
    }),
  editName: protectedProcedure
    .input(editTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { list: { include: { board: true } } },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: task?.list.board.projectId },
        include: { users: true },
      })

      if (!project || !task) {
        throw new Error("Project or task does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      })

      return updatedTask
    }),
  editColor: protectedProcedure
    .input(colorSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { list: { include: { board: true } } },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: task?.list.board.projectId },
        include: { users: true },
      })

      if (!project || !task) {
        throw new Error("Project or task does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const updatedTask = await ctx.prisma.task.update({
        where: { id: task.id },
        data: {
          color: input.color,
        },
      })

      return updatedTask
    }),
  editUsers: protectedProcedure
    .input(editTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.id },
        include: { list: { include: { board: true } } },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: task?.list.board.projectId },
        include: { users: true },
      })

      if (!project || !task) {
        throw new Error("Project or task does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.assigned_to },
        },
      })

      const updatedTask = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          assigned_to: { set: users.map((user) => ({ id: user.id })) },
        },
      })

      return updatedTask
    }),
  reorder: protectedProcedure
    .input(
      z.object({
        itemOneId: z.string(),
        itemTwoId: z.string().or(z.undefined()),
        itemOneOrder: z.number(),
        itemTwoOrder: z.number().or(z.undefined()),
        listId: z.string(),
        prevListId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const taskDragged = await ctx.prisma.task.findUnique({
        where: { id: input.itemOneId },
        include: { list: { include: { board: true } } },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: taskDragged?.list.board.projectId },
        include: { users: true },
      })

      if (!project || !taskDragged) {
        throw new Error("Project or task does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      const prevListId = taskDragged.listId

      if (prevListId !== input.listId) {
        await ctx.prisma.task.update({
          where: { id: input.itemOneId },
          data: {
            listId: { set: input.listId },
            order: input.itemTwoOrder,
          },
        })

        const taskDraggedUpdated = await ctx.prisma.task.findUnique({
          where: { id: input.itemOneId },
        })

        await ctx.prisma.task.updateMany({
          where: {
            AND: [
              { listId: prevListId },
              { order: { gt: input.itemOneOrder } },
              { NOT: { id: input.itemOneId } },
            ],
          },
          data: { order: { decrement: 1 } },
        })

        await ctx.prisma.task.updateMany({
          where: {
            AND: [
              { listId: taskDraggedUpdated?.listId },
              { order: { gte: input.itemTwoOrder } },
              { NOT: { id: input.itemOneId } },
            ],
          },
          data: { order: { increment: 1 } },
        })
      } else {
        await ctx.prisma.task.update({
          where: { id: input.itemOneId },
          data: { order: input.itemTwoOrder },
        })

        if (input.itemOneOrder > input.itemTwoOrder!) {
          await ctx.prisma.task.updateMany({
            where: {
              AND: [
                { listId: input.listId },
                { order: { gte: input.itemTwoOrder } },
                { order: { lte: input.itemOneOrder } },
                { NOT: { id: input.itemOneId } },
              ],
            },
            data: { order: { increment: 1 } },
          })
        }

        if (input.itemOneOrder < input.itemTwoOrder!) {
          await ctx.prisma.task.updateMany({
            where: {
              AND: [
                { listId: input.listId },
                { order: { lte: input.itemTwoOrder } },
                { order: { gte: input.itemOneOrder } },
                { NOT: { id: input.itemOneId } },
              ],
            },
            data: { order: { decrement: 1 } },
          })
        }
      }

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input },
        include: { list: { include: { board: true } } },
      })

      const project = await ctx.prisma.project.findUnique({
        where: { id: task?.list.board.projectId },
        include: { users: true },
      })

      if (!project || !task) {
        throw new Error("Project or task does not exist")
      }

      if (
        project.ownerId !== ctx.session.user.id &&
        !project.users.map((u) => u.userId).includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      await ctx.prisma.task.delete({
        where: { id: task.id },
      })

      await ctx.prisma.task.updateMany({
        where: {
          AND: [
            { listId: task.listId },
            { order: { gt: task.order } },
            { NOT: { id: task.id } },
          ],
        },
        data: { order: { decrement: 1 } },
      })

      return { success: true }
    }),
})
