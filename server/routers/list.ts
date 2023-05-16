import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardAndProjectSchema } from "@/components/Project"
import { colorSchema } from "@/components/ColorPicker"
import { boardSchema } from "@/components/Boards"
import { listSchema } from "@/components/List"

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(listSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.create({
        data: input,
      })
      return list
    }),
  editName: protectedProcedure
    .input(listSchema)
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
      console.log(input)
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
