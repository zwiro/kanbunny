import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardAndProjectSchema } from "@/components/Project"
import { colorSchema } from "@/components/ColorPicker"
import { boardSchema } from "@/components/Boards"
import { listSchema } from "@/pages"

export const listRouter = createTRPCRouter({
  create: protectedProcedure
    .input(listSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.create({
        data: input,
      })
      return list
    }),
})
