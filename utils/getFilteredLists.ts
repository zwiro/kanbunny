import type { TaskWithAssignedTo } from "@/types/trpc"
import type { List } from "@prisma/client"
import getFilteredTasks from "./getFilteredTasks"
import { date } from "zod"

type ListWithTasks = List & { tasks: TaskWithAssignedTo[] }

export default function getFilteredLists(
  lists: ListWithTasks[],
  hideEmptyLists: boolean = false,
  assignedFilter: string | null,
  dateFilter: string | Date | null,
  userId: string | undefined
) {
  if (hideEmptyLists) {
    return lists.filter(
      (list) =>
        getFilteredTasks(list.tasks, assignedFilter, dateFilter, userId)
          .length > 0
    )
  } else {
    return lists
  }
}
