import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { colorSchema } from "@/types/schemas"
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

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.delete({
        where: { id: input },
      })
      return list
    }),
})
