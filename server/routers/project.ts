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
            boards: true,
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
          AND: [
            { projects_in: { some: { projectId: input } } },
            { NOT: { id: ctx.session.user.id } },
          ],
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
                not: ctx.session.user.id!,
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
      await ctx.prisma.project.update({
        where: { id: project.id },
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
  delete: publicProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const projectUser = await ctx.prisma.projectUser.findFirst({
      where: { projectId: input },
      include: { project: true },
    })

    if (projectUser?.project.ownerId !== ctx.session!.user.id) {
      throw new Error("You are not the owner of this project")
    }

    const users = await ctx.prisma.user.findMany({
      where: {
        projects_in: { some: { id: input } },
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
        AND: [{ NOT: { id: input } }, { order: { gt: projectUser.order } }],
      },
      data: { order: { decrement: 1 } },
    })
    return { success: true }
  }),
})
