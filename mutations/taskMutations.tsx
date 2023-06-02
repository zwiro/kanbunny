import { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"

export const createNewTask = (
  boardId: string,
  utils: TRPCContextType,
  close: () => void
) =>
  trpc.task.create.useMutation({
    onSuccess: () => {
      utils.list.getByBoard.invalidate(boardId)
      close()
    },
  })

export const updatedTaskName = (
  boardId: string,
  listId: string,
  utils: TRPCContextType,
  closeEditName: () => void
) =>
  trpc.task.editName.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) =>
          l.id === listId
            ? {
                ...l,
                tasks: l.tasks.map((t) =>
                  t.id === input.id ? { ...t, name: input.name } : t
                ),
              }
            : l
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      utils.list.getByBoard.invalidate(boardId)
      closeEditName()
    },
  })

export const updateTaskUsers = (
  boardId: string,
  utils: TRPCContextType,
  closeEditUsers: () => void
) =>
  trpc.task.editUsers.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()

      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      utils.list.getByBoard.invalidate(boardId)
      closeEditUsers()
    },
  })

export const deleteOneTask = (
  boardId: string,
  listId: string,
  utils: TRPCContextType
) =>
  trpc.task.delete.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) =>
          l.id === listId
            ? {
                ...l,
                tasks: l.tasks.filter((t) => t.id !== input),
              }
            : l
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      utils.list.getByBoard.invalidate(boardId)
    },
  })

export const updateTaskColor = (
  boardId: string,
  listId: string,
  utils: TRPCContextType,
  closeEditColor: () => void
) =>
  trpc.task.editColor.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) =>
          l.id === listId
            ? {
                ...l,
                tasks: l.tasks.map((t) =>
                  t.id === input.id ? { ...t, color: input.color } : t
                ),
              }
            : l
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled: () => {
      utils.list.getByBoard.invalidate(boardId)
      closeEditColor()
    },
  })

export const reorderTasks = (boardId: string, utils: TRPCContextType) =>
  trpc.task.reorder.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) => {
        const taskDragged = old
          ?.filter((l) => l.tasks.find((t) => t.id === input.draggableId))[0]
          .tasks.find((t) => t.id === input.draggableId)
        return old?.map((l) => {
          if (input.listId !== input.prevListId) {
            return l.tasks.find((t) => t.id === input.draggableId)
              ? {
                  ...l,
                  tasks: l.tasks
                    .filter((t) => t.id !== input.draggableId)
                    .map((t) =>
                      t.order > input.itemOneIndex
                        ? { ...t, order: t.order - 1 }
                        : t
                    )
                    .sort((a, b) => a!.order - b!.order),
                }
              : l.id === input.listId
              ? {
                  ...l,
                  tasks: [
                    ...l.tasks.map((t) =>
                      t.order >= input.itemTwoIndex
                        ? { ...t, order: t.order + 1 }
                        : t
                    ),
                    { ...taskDragged, order: input.itemTwoIndex - 1 },
                  ].sort((a, b) => a!.order - b!.order),
                }
              : l
          } else if (input.listId === input.prevListId) {
            return l.id === input.listId
              ? {
                  ...l,
                  tasks: l.tasks.map((t) =>
                    t.id === input.draggableId
                      ? { ...t, order: input.itemTwoIndex }
                      : input.itemOneIndex > input.itemTwoIndex &&
                        t.order >= input.itemTwoIndex &&
                        t.order <= input.itemOneIndex
                      ? { ...t, order: t.order + 1 }
                      : input.itemOneIndex < input.itemTwoIndex &&
                        t.order <= input.itemTwoIndex &&
                        t.order >= input.itemOneIndex
                      ? { ...t, order: t.order - 1 }
                      : t
                  ),
                }
              : l
          } else return l
        }) as any
      })
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      utils.list.getByBoard.invalidate()
    },
  })
