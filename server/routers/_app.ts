import { z } from "zod"
import { protectedProcedure, router } from "../trpc"
export const appRouter = router({
  hello: protectedProcedure.query(({ input }) => {
    return {
      greeting: `hello`,
    }
  }),
})
export type AppRouter = typeof appRouter
