import { z } from "zod"

export const editListSchema = z.object({
  name: z.string().min(1, { message: "list name is required" }),
  boardId: z.string(),
  id: z.string(),
})

export const editTaskSchema = z.object({
  name: z.string(),
  id: z.string(),
  listId: z.string(),
  assigned_to: z.array(z.string()).optional(),
})
