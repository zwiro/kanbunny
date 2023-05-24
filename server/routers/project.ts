import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { projectSchema, reorderSchema } from "@/types/schemas"

export const projectRouter = createTRPCRouter({
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.projectUser.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        project: {
          include: {
            boards: true,
            invited_users: true,
            owner: true,
            users: {
              where: { userId: ctx.session.user.id },
              select: { order: true },
            },
          },
        },
      },
    })
    const modifiedProjects = projects.map((project) => ({
      ...project.project,
      order: project.project.users[0].order,
    }))
    return modifiedProjects
  }),
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input },
      })
      return project
    }),
  getUsers: protectedProcedure //move to user router
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            { projects_in: { some: { id: input } } },
            { invites: { some: { id: input } } },
          ],
          NOT: { id: ctx.session.user.id },
        },
      })
      return users
    }),
  getOrder: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.projectUser.findFirst({
        where: { projectId: input },
        select: { order: true },
      })
      return order
    }),
  getLength: protectedProcedure.query(async ({ ctx }) => {
    const length = await ctx.prisma.projectUser.count({
      where: { userId: ctx.session.user.id },
    })
    return length
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
          users: {
            create: {
              user: { connect: { id: ctx.session.user.id } },
              order: 0,
            },
          },
          invited_users: {
            connect: invitedUsers
              .filter((user) => user.id !== ctx.session.user.id)
              .map((user) => ({ id: user.id })),
          },
        },
      })
      await ctx.prisma.projectUser.updateMany({
        where: { NOT: { projectId: project.id } },
        data: { order: { increment: 1 } },
      })
      return project
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
  reorder: protectedProcedure
    .input(reorderSchema)
    .mutation(async ({ ctx, input }) => {
      const projectDragged = await ctx.prisma.projectUser.findFirst({
        where: { order: input.itemOneIndex },
      })

      await ctx.prisma.projectUser.update({
        where: { id: projectDragged?.id },
        data: { order: input.itemTwoIndex },
      })

      if (input.itemOneIndex > input.itemTwoIndex) {
        await ctx.prisma.projectUser.updateMany({
          where: {
            AND: [
              { order: { gte: input.itemTwoIndex } },
              { order: { lte: input.itemOneIndex } },
              { NOT: { id: projectDragged?.id } },
            ],
          },
          data: { order: { increment: 1 } },
        })
      }

      if (input.itemOneIndex < input.itemTwoIndex) {
        await ctx.prisma.projectUser.updateMany({
          where: {
            AND: [
              { order: { lte: input.itemTwoIndex } },
              { order: { gte: input.itemOneIndex } },
              { NOT: { id: projectDragged?.id } },
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
