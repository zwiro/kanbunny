import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardAndProjectSchema } from "@/components/Project"
import { colorSchema } from "@/components/ColorPicker"

export const boardRouter = createTRPCRouter({
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
    .input(boardAndProjectSchema.extend({ id: z.string() }))
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
