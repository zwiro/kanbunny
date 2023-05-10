import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardSchema } from "@/components/SideMenu"
import { colorSchema } from "@/components/ColorPicker"

export const projectRouter = createTRPCRouter({
  user: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      where: { users: { some: { id: ctx.session.user.id } } },
      include: { boards: true, users: true, invited_users: true },
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
  editUsers: protectedProcedure
    .input(
      z.object({ projectId: z.string(), participants: z.array(z.string()) })
    )
    .mutation(async ({ ctx, input }) => {
      const participatingUsers = await ctx.prisma.user.findMany({
        where: {
          AND: [
            { projects_in: { some: { id: { in: input.projectId } } } },
            { name: { in: input.participants } },
          ],
        },
      })
      const invitedUsers = await ctx.prisma.user.findMany({
        where: {
          AND: [
            { projects_in: { none: { id: { in: input.projectId } } } },
            { name: { in: input.participants } },
          ],
        },
      })
      const project = await ctx.prisma.project.update({
        where: { id: input.projectId },
        data: {
          invited_users: {
            set: invitedUsers
              .filter((user) => user.id !== ctx.session.user.id)
              .map((user) => ({ id: user.id })),
          },
          users: {
            disconnect: participatingUsers
              .filter((user) => user.id !== ctx.session.user.id)
              .map((user) => ({ id: user.id })),
          },
        },
      })
      return project
    }),
  editName: protectedProcedure
    .input(
      projectSchema
        .omit({ invited_users: true })
        .extend({ projectId: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.update({
        where: { id: input.projectId },
        data: {
          name: input.name,
        },
      })
      return project
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
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            { projects_in: { some: { id: input } } },
            { invites: { some: { id: input } } },
          ],
        },
      })
      users.map(async (user) => {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            projects_in: { disconnect: { id: input } },
            invites: { disconnect: { id: input } },
          },
        })
      })
      return await ctx.prisma.project.delete({
        where: { id: input },
      })
    }),
})
