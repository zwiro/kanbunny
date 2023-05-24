import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(1, { message: "project name is required" }),
  invited_users: z.array(z.string()).optional(),
})

export const boardSchema = z.object({
  name: z.string().min(1, { message: "board name is required" }),
  id: z.string(),
})

export const listSchema = z.object({
  name: z.string().min(1, { message: "list name is required" }),
  boardId: z.string(),
})

export const taskSchema = z.object({
  name: z.string().min(1, { message: "task name is required" }),
  assigned_to: z.array(z.string()).optional(),
  due_to: z.date().optional(),
  listId: z.string(),
})

export const boardAndProjectSchema = z.object({
  name: z.string().min(1, { message: "name is required" }),
  projectId: z.string(),
})

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

export const colorSchema = z.object({
  color: z.enum(["red", "blue", "green", "yellow", "pink"]),
  id: z.string(),
})

export const reorderSchema = z.object({
  itemOneIndex: z.number(),
  itemTwoIndex: z.number(),
  draggableId: z.string(),
})
