import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { projectRouter } from "./project"
export const appRouter = createTRPCRouter({
  project: projectRouter,
})
export type AppRouter = typeof appRouter
