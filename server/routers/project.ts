import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardSchema } from "@/components/SideMenu"

export const projectRouter = createTRPCRouter({
  user: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      where: { users: { some: { id: ctx.session.user.id } } },
      include: { boards: true },
    })
    return projects
  }),
  create: protectedProcedure
    .input(projectSchema)
    .mutation(async ({ ctx, input }) => {
      const invitedUsers = await ctx.prisma.user.findMany({
        where: { name: { in: input.invited_users } },
      })
      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          ownerId: ctx.session.user.id,
          users: { connect: { id: ctx.session.user.id } },
          invited_users: {
            connect: invitedUsers
              .filter((user) => user.id !== ctx.session.user.id)
              .map((user) => ({ id: user.id })),
          },
        },
      })
      return project
    }),
  createBoard: protectedProcedure
    .input(boardSchema)
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.create({
        data: input,
      })
      return board
    }),
  // boards: protectedProcedure
  //   .input(z.object({ projectId: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     const boards = await ctx.prisma.board.findMany({
  //       where: { projectId: input?.projectId },
  //     })
  //     return boards
  //   }),
  delete: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.project.deleteMany()
  }),
})
