import { trpc } from "@/utils/trpc"
import { Board, List, Prisma, User } from "@prisma/client"

export type TRPCContextType = ReturnType<typeof trpc.useContext>

export type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>

export type ListWithTasks = List & { tasks: TaskWithAssignedTo[] }

export type ProjectWithUsers = {
  order: number
  id: string
  name: string
  ownerId: string
  created_at: Date
  updated_at: Date
  owner: User
  boards: Board[]
  users: {
    order: number
  }[]
}
