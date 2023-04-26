import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"

export const projectRouter = createTRPCRouter({
  user: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({})
    return projects
  }),
  create: protectedProcedure
    .input(projectSchema)
    .mutation(async ({ ctx, input }) => {
      const owner = await ctx.prisma.user.findUnique({
        where: { email: ctx.session.user.email! },
      })
      const invitedUsers = await ctx.prisma.user.findMany({
        where: { name: { in: input.invited_users } },
      })
      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          ownerId: owner?.id,
          users: { connect: { id: owner?.id } },
          invited_users: {
            connect: invitedUsers
              .filter((user) => user.id !== owner?.id)
              .map((user) => ({ id: user.id })),
          },
        },
      })
      return project
    }),
  delete: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.project.deleteMany()
  }),
})
