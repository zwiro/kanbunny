import { Prisma } from "@prisma/client"

type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>

const isDate = (date: string | Date | null): date is Date => {
  return date instanceof Date
}

export default function getFilteredTasks(
  tasks: TaskWithAssignedTo[],
  assignFilter: string | null,
  dateFilter: string | Date | null,
  userId: string | undefined
) {
  return getDateFilteredTasks(
    getAssignedFilteredTasks(tasks, assignFilter, userId),
    dateFilter
  )
}

function getDateFilteredTasks(
  tasks: TaskWithAssignedTo[],
  filter: string | Date | null
) {
  if (isDate(filter)) {
    return tasks.filter((task) => {
      if (task.due_to) {
        const timeDiff = task.due_to
          ? filter.getTime() - task.due_to.getTime()
          : 0
        return timeDiff > 0 && task.due_to?.getTime() > new Date().getTime()
      } else {
        return false
      }
    })
  } else {
    switch (filter) {
      case "tomorrow":
        return tasks.filter((task) => {
          const timeDiff = task.due_to
            ? task.due_to.getTime() - new Date().getTime()
            : 0
          const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          return daysLeft <= 1 && timeDiff > 0
        })
      case "next_week":
        return tasks.filter((task) => {
          const timeDiff = task.due_to
            ? task.due_to.getTime() - new Date().getTime()
            : 0
          const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          return daysLeft <= 7 && timeDiff > 0
        })
      case "next_month":
        return tasks.filter((task) => {
          const timeDiff = task.due_to
            ? task.due_to.getTime() - new Date().getTime()
            : 0
          const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          return daysLeft <= 30 && timeDiff > 0
        })
      default:
        return tasks
    }
  }
}

function getAssignedFilteredTasks(
  tasks: TaskWithAssignedTo[],
  filter: string | null,
  userId: string | undefined
) {
  switch (filter) {
    case "unassigned":
      return tasks.filter((task) => task.assigned_to.length === 0)
    case "assigned":
      return tasks.filter((task) => task.assigned_to.length > 0)
    case "assigned_user":
      return tasks.filter((task) =>
        task.assigned_to.find((user) => user.id === userId)
      )
    default:
      return tasks
  }
}
