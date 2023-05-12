import { z } from "zod"
import { protectedProcedure, createTRPCRouter } from "../trpc"
import { projectRouter } from "./project"
import { boardRouter } from "./board"
import { listRouter } from "./list"
export const appRouter = createTRPCRouter({
  project: projectRouter,
  board: boardRouter,
  list: listRouter,
})
export type AppRouter = typeof appRouter
