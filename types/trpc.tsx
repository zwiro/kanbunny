import { trpc } from "@/utils/trpc"

export type TRPCContextType = ReturnType<typeof trpc.useContext>
