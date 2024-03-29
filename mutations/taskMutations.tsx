import type { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"
import { MutableRefObject } from "react"

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
  closeEditName: () => void,
  counter: MutableRefObject<number>
) =>
  trpc.task.editName.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      counter.current += 1
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
      closeEditName()
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      counter.current -= 1
      counter.current === 0 && utils.list.getByBoard.invalidate(boardId)
    },
  })

export const updateTaskUsers = (
  boardId: string,
  utils: TRPCContextType,
  closeEditUsers: () => void,
  counter: MutableRefObject<number>
) =>
  trpc.task.editUsers.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      counter.current += 1
      const prevData = utils.list.getByBoard.getData()

      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      counter.current -= 1
      counter.current === 0 && utils.list.getByBoard.invalidate(boardId)
      closeEditUsers()
    },
  })

export const updateTaskColor = (
  boardId: string,
  listId: string,
  utils: TRPCContextType,
  closeEditColor: () => void,
  counter: MutableRefObject<number>
) =>
  trpc.task.editColor.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      counter.current += 1
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
      closeEditColor()
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled: () => {
      counter.current -= 1
      counter.current === 0 && utils.list.getByBoard.invalidate(boardId)
    },
  })

export const updateTaskDate = (
  boardId: string,
  listId: string,
  utils: TRPCContextType,
  closeEditDate: () => void,
  counter: MutableRefObject<number>
) =>
  trpc.task.editDate.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      counter.current += 1
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) =>
          l.id === listId
            ? {
                ...l,
                tasks: l.tasks.map((t) =>
                  t.id === input.id ? { ...t, due_to: input.due_to } : t
                ),
              }
            : l
        )
      )
      closeEditDate()
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled: () => {
      closeEditDate()
      counter.current -= 1
      counter.current === 0 && utils.list.getByBoard.invalidate(boardId)
    },
  })

export const reorderTasks = (
  boardId: string,
  utils: TRPCContextType,
  counter: MutableRefObject<number>
) =>
  trpc.task.reorder.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      counter.current += 1
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) => {
        const taskDragged = old
          ?.filter((l) => l.tasks.find((t) => t.id === input.itemOneId))[0]
          ?.tasks.find((t) => t.id === input.itemOneId)

        return old?.map((l) => {
          if (input.listId !== input.prevListId) {
            return l.tasks.find((t) => t.id === input.itemOneId)
              ? {
                  ...l,
                  tasks: l.tasks
                    .filter((t) => t.id !== input.itemOneId)
                    .map((t) =>
                      t.order > input.itemOneOrder
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
                      t.order >= input.itemTwoOrder!
                        ? { ...t, order: t.order + 1 }
                        : t
                    ),
                    { ...taskDragged, order: input.itemTwoOrder! - 1 },
                  ].sort((a, b) => a!.order - b!.order),
                }
              : l
          } else if (input.listId === input.prevListId) {
            return l.id === input.listId
              ? {
                  ...l,
                  tasks: l.tasks
                    .map((t) =>
                      t.id === input.itemOneId
                        ? { ...t, order: input.itemTwoOrder! }
                        : input.itemOneOrder > input.itemTwoOrder! &&
                          t.order >= input.itemTwoOrder! &&
                          t.order <= input.itemOneOrder
                        ? { ...t, order: t.order + 1 }
                        : input.itemOneOrder < input.itemTwoOrder! &&
                          t.order <= input.itemTwoOrder! &&
                          t.order >= input.itemOneOrder
                        ? { ...t, order: t.order - 1 }
                        : t
                    )
                    .sort((a, b) => a!.order - b!.order),
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
      counter.current -= 1
      counter.current === 0 && utils.list.getByBoard.invalidate(boardId)
    },
  })

export const deleteOneTask = (
  boardId: string,
  listId: string,
  utils: TRPCContextType,
  counter: MutableRefObject<number>
) =>
  trpc.task.delete.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      counter.current += 1
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
      counter.current -= 1
      counter.current === 0 && utils.list.getByBoard.invalidate(boardId)
    },
  })
