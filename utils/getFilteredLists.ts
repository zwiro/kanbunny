import type { ListWithTasks } from "@/types/trpc"
import getFilteredTasks from "./getFilteredTasks"

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
