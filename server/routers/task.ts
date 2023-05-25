import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { colorSchema, reorderSchema, taskSchema } from "@/types/schemas"
import { editTaskSchema } from "@/types/schemas"

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(taskSchema)
    .mutation(async ({ ctx, input }) => {
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
          id: { not: task.id },
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
      const task = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      })
      return task
    }),
  editColor: protectedProcedure
    .input(colorSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          color: input.color,
        },
      })
      return task
    }),
  editUsers: protectedProcedure
    .input(editTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.assigned_to },
        },
      })
      const task = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          assigned_to: { set: users.map((user) => ({ id: user.id })) },
        },
      })
      return task
    }),
  reorder: protectedProcedure
    .input(reorderSchema)
    .mutation(async ({ ctx, input }) => {
      const taskDragged = await ctx.prisma.task.findUnique({
        where: { id: input.draggableId },
      })
      await ctx.prisma.task.update({
        where: { id: taskDragged?.id },
        data: { order: input.itemTwoIndex },
      })
      if (input.itemOneIndex > input.itemTwoIndex) {
        await ctx.prisma.task.updateMany({
          where: {
            AND: [
              { order: { gte: input.itemTwoIndex } },
              { order: { lte: input.itemOneIndex } },
              { NOT: { id: taskDragged?.id } },
            ],
          },
          data: { order: { increment: 1 } },
        })
      }

      if (input.itemOneIndex < input.itemTwoIndex) {
        await ctx.prisma.task.updateMany({
          where: {
            AND: [
              { order: { lte: input.itemTwoIndex } },
              { order: { gte: input.itemOneIndex } },
              { NOT: { id: taskDragged?.id } },
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
      const list = await ctx.prisma.task.delete({
        where: { id: input },
      })
      return list
    }),
})
