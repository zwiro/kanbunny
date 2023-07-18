import { z } from "zod"
import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc"
import { projectSchema, reorderSchema } from "@/utils/schemas"

export const projectRouter = createTRPCRouter({
  getByUser: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.projectUser.findMany({
      where: { userId: ctx.session.user.id },
      select: {
        project: {
          include: {
            boards: { orderBy: { order: "asc" } },
            owner: true,
            users: {
              where: { userId: ctx.session.user.id },
              select: { order: true },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    })

    const modifiedProjects = projects.map((project) => ({
      ...project.project,
      order: project.project.users[0].order,
    }))

    return modifiedProjects
  }),
  getUsers: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          AND: [
            { projects_in: { some: { projectId: input } } },
            { NOT: { id: ctx.session.user.id } },
          ],
        },
      })

      return users
    }),
  getAllUsers: protectedProcedure
    .input(z.string().or(z.undefined()))
    .query(async ({ ctx, input }) => {
      if (!input) {
        return []
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          NOT: { id: ctx.session.user.id },
          name: { contains: input },
        },
      })

      return users
    }),
  create: protectedProcedure
    .input(projectSchema)
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: { name: { in: input.users } },
      })

      const userIds = users
        .filter((user) => user.id !== ctx.session.user.id)
        .map((user) => ({ userId: user.id, order: 0 }))

      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          ownerId: ctx.session.user.id,
          users: {
            createMany: {
              data: [...userIds, { userId: ctx.session.user.id, order: 0 }],
            },
          },
        },
      })

      await ctx.prisma.projectUser.updateMany({
        where: {
          AND: [
            { NOT: { projectId: project.id } },
            {
              userId: { in: [...users.map((u) => u.id), ctx.session.user.id] },
            },
          ],
        },
        data: { order: { increment: 1 } },
      })

      return project
    }),
  editUsers: protectedProcedure
    .input(
      z.object({ projectId: z.string(), participants: z.array(z.string()) })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
      })

      if (project?.ownerId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this project")
      }

      const toDeleteUsers = await ctx.prisma.user.findMany({
        where: {
          AND: [
            { projects_in: { some: { projectId: { in: input.projectId } } } },
            { name: { notIn: input.participants } },
          ],
        },
      })

      const newUsers = await ctx.prisma.user.findMany({
        where: {
          AND: [
            {
              NOT: {
                projects_in: { some: { projectId: { in: input.projectId } } },
              },
            },
            { name: { in: input.participants } },
          ],
        },
      })

      await ctx.prisma.projectUser.deleteMany({
        where: {
          AND: [
            { projectId: input.projectId },
            {
              userId: {
                in: toDeleteUsers.map((u) => u.id),
                not: ctx.session.user.id,
              },
            },
          ],
        },
      })

      for (let user of newUsers) {
        await ctx.prisma.projectUser.create({
          data: {
            projectId: input.projectId,
            userId: user.id,
            order: 0,
          },
        })
      }

      return { success: true }
    }),
  editName: protectedProcedure
    .input(
      projectSchema.omit({ users: true }).extend({ projectId: z.string() })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
      })

      if (project?.ownerId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this project")
      }

      const updatedProject = await ctx.prisma.project.update({
        where: { id: project.id },
        data: {
          name: input.name,
        },
      })
      return updatedProject
    }),
  reorder: protectedProcedure
    .input(reorderSchema)
    .mutation(async ({ ctx, input }) => {
      const projectDragged = await ctx.prisma.projectUser.findFirst({
        where: {
          AND: [
            { projectId: input.draggableId },
            { userId: ctx.session.user.id },
            { order: input.itemOneIndex },
          ],
        },
        include: { project: { include: { users: true } } },
      })

      if (!projectDragged) {
        throw new Error("Project does not exist")
      }

      if (
        projectDragged.project.ownerId !== ctx.session.user.id &&
        !projectDragged.project.users
          .map((u) => u.userId)
          .includes(ctx.session.user.id)
      ) {
        throw new Error("You are not a member of this project")
      }

      await ctx.prisma.projectUser.updateMany({
        where: {
          AND: [
            { projectId: projectDragged.projectId },
            { userId: ctx.session.user.id },
          ],
        },
        data: { order: input.itemTwoIndex },
      })

      if (input.itemOneIndex > input.itemTwoIndex) {
        await ctx.prisma.projectUser.updateMany({
          where: {
            AND: [
              { userId: ctx.session.user.id },
              { order: { gte: input.itemTwoIndex } },
              { order: { lte: input.itemOneIndex } },
              { NOT: { projectId: projectDragged.projectId } },
            ],
          },
          data: { order: { increment: 1 } },
        })
      }

      if (input.itemOneIndex < input.itemTwoIndex) {
        await ctx.prisma.projectUser.updateMany({
          where: {
            AND: [
              { userId: ctx.session.user.id },
              { order: { lte: input.itemTwoIndex } },
              { order: { gte: input.itemOneIndex } },
              { NOT: { projectId: projectDragged.projectId } },
            ],
          },
          data: { order: { decrement: 1 } },
        })
      }

      return { success: true }
    }),
  leave: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findUnique({
        where: { id: input },
        include: { users: true },
      })

      if (!project) {
        throw new Error("Project does not exist")
      }

      const projectUser = await ctx.prisma.projectUser.findFirst({
        where: { projectId: project.id },
        include: { project: true },
      })

      if (!project.users.map((u) => u.userId).includes(ctx.session.user.id))
        throw new Error("You are not a member of this project")
      await ctx.prisma.projectUser.deleteMany({
        where: { projectId: input, userId: ctx.session.user.id },
      })

      await ctx.prisma.projectUser.updateMany({
        where: {
          AND: [
            { NOT: { id: input } },
            { order: { gt: projectUser!.order } },
            { userId: ctx.session.user.id },
          ],
        },
        data: { order: { decrement: 1 } },
      })

      return { success: true }
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const projectUser = await ctx.prisma.projectUser.findFirst({
        where: { projectId: input },
        include: { project: true },
      })

      if (projectUser?.project.ownerId !== ctx.session.user.id) {
        throw new Error("You are not the owner of this project")
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          projects_in: { some: { projectId: input } },
        },
      })

      users.map(async (user) => {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            projects_in: { disconnect: { id: input } },
          },
        })
      })

      await ctx.prisma.projectUser.deleteMany({
        where: { projectId: input },
      })

      await ctx.prisma.project.deleteMany({
        where: { id: input },
      })

      await ctx.prisma.projectUser.updateMany({
        where: {
          AND: [
            { NOT: { id: input } },
            { order: { gt: projectUser.order } },
            {
              userId: { in: [...users.map((u) => u.id), ctx.session.user.id] },
            },
          ],
        },
        data: { order: { decrement: 1 } },
      })

      return { success: true }
    }),
})
