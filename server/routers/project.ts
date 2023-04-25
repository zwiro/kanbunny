import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"

export const projectRouter = createTRPCRouter({
  user: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({})
    return projects
  }),
  create: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        ownerId: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.create({
        data: input,
      })
      return project
    }),
})
