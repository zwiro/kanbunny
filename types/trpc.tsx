import { trpc } from "@/utils/trpc"
import { List, Prisma } from "@prisma/client"

export type TRPCContextType = ReturnType<typeof trpc.useContext>

export type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>

export type ListWithTasks = List & { tasks: TaskWithAssignedTo[] }
