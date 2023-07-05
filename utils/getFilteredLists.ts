import type { TaskWithAssignedTo } from "@/types/trpc"
import type { List } from "@prisma/client"

type ListWithTasks = List & { tasks: TaskWithAssignedTo[] }

export default function getFilteredLists(
  lists: ListWithTasks[],
  hideEmptyLists: boolean = false
) {
  if (hideEmptyLists) {
    return lists.filter((list) => list.tasks.length > 0)
  } else {
    return lists
  }
}
