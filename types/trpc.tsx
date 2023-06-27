import { trpc } from "@/utils/trpc"
import { Prisma } from "@prisma/client"

export type TRPCContextType = ReturnType<typeof trpc.useContext>

export type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>
