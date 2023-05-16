import { z } from "zod"
import { protectedProcedure, publicProcedure, createTRPCRouter } from "../trpc"
import { projectSchema } from "@/components/AddProjectModal"
import { boardAndProjectSchema } from "@/components/Project"
import { colorSchema } from "@/components/ColorPicker"
import { boardSchema } from "@/components/Boards"
import { listSchema } from "@/pages"
import { taskSchema } from "@/components/AddTaskModal"
import { editTaskSchema } from "@/components/List"

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(taskSchema)
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          name: { in: input.assigned_to },
        },
      })
      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          assigned_to: { connect: users.map((user) => ({ id: user.id })) },
        },
      })
      return task
    }),
  editName: protectedProcedure
    .input(editTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      })
      return task
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
