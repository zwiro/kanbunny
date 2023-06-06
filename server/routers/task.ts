import { string, z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { colorSchema, reorderSchema, taskSchema } from "@/utils/schemas"
import { editTaskSchema } from "@/utils/schemas"

export const taskRouter = createTRPCRouter({
  // getByList: protectedProcedure
  //   .input(z.string())
  //   .query(async ({ ctx, input }) => {
  //     const tasks = await ctx.prisma.task.findMany({
  //       where: {
  //         listId: input,
  //       },
  //       include: {
  //         assigned_to: true,
  //       },
  //       orderBy: {
  //         order: "asc",
  //       },
  //     })
  //     return tasks
  //   }),

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
      })

      const prevListId = taskDragged?.listId

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
      const list = await ctx.prisma.task.delete({
        where: { id: input },
      })
      return list
    }),
})
