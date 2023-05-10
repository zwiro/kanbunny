import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { projectRouter } from "./project"
import { boardRouter } from "./board"
export const appRouter = createTRPCRouter({
  project: projectRouter,
  board: boardRouter,
})
export type AppRouter = typeof appRouter
