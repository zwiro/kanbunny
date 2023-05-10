import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardSchema } from "@/components/SideMenu"
import { colorSchema } from "@/components/ColorPicker"

export const boardRouter = createTRPCRouter({
  create: protectedProcedure
    .input(boardSchema)
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
})
