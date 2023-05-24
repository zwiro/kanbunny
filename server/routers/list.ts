import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { colorSchema, reorderSchema } from "@/types/schemas"
import { listSchema } from "@/types/schemas"
import { editListSchema } from "@/types/schemas"

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(listSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.create({
        data: {
          name: input.name,
          boardId: input.boardId,
          order: 0,
        },
      })
      await ctx.prisma.list.updateMany({
        where: { NOT: { id: list.id } },
        data: { order: { increment: 1 } },
      })
      return list
    }),
  editName: protectedProcedure
    .input(editListSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      })
      return list
    }),
  editColor: protectedProcedure
    .input(colorSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          color: input.color,
        },
      })
      return list
    }),
  reorder: protectedProcedure
    .input(reorderSchema)
    .mutation(async ({ ctx, input }) => {
      const listDragged = await ctx.prisma.list.findUnique({
        where: { id: input.draggableId },
      })
      await ctx.prisma.list.update({
        where: { id: listDragged?.id },
        data: { order: input.itemTwoIndex },
      })
      if (input.itemOneIndex > input.itemTwoIndex) {
        await ctx.prisma.list.updateMany({
          where: {
            AND: [
              { order: { gte: input.itemTwoIndex } },
              { order: { lte: input.itemOneIndex } },
              { NOT: { id: listDragged?.id } },
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
              { NOT: { id: listDragged?.id } },
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
      const list = await ctx.prisma.list.delete({
        where: { id: input },
      })
      return list
    }),
})
