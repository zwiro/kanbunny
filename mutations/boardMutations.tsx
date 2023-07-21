import type { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"
import type { Board } from "@prisma/client"
import type { UseFormReturn } from "react-hook-form"

export const createNewBoard = (
  utils: TRPCContextType,
  closeAdd: () => void,
  boardMethods: UseFormReturn<
    {
      name: string
      projectId: string
    },
    any
  >
) =>
  trpc.board.create.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === input.projectId
            ? {
                ...p,
                boards: [
                  {
                    ...input,
                    color: "red",
                    order: 0,
                    id: `temp-${Math.random().toString()}`,
                  } as Board,
                  ...p.boards,
                ],
              }
            : p
        )
      )
      closeAdd()
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
      boardMethods.reset()
    },
  })

export const updateBoardName = (
  projectId: string,
  utils: TRPCContextType,
  closeEditName: () => void,
  counter: React.MutableRefObject<number>
) =>
  trpc.board.editName.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.map((b) =>
                  b.id === input.id ? { ...b, name: input.name } : b
                ),
              }
            : p
        )
      )
      closeEditName()
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      counter.current -= 1
      counter.current === 0 && utils.project.getByUser.invalidate()
    },
  })

export const updateBoardColor = (
  projectId: string,
  utils: TRPCContextType,
  closeEditColor: () => void,
  counter: React.MutableRefObject<number>
) =>
  trpc.board.editColor.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.map((b) =>
                  b.id === input.id ? { ...b, color: input.color } : b
                ),
              }
            : p
        )
      )
      closeEditColor()
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled: () => {
      counter.current -= 1
      counter.current === 0 && utils.project.getByUser.invalidate()
    },
  })

export const reorderBoards = (
  projectId: string,
  utils: TRPCContextType,
  counter: React.MutableRefObject<number>
) =>
  trpc.board.reorder.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards
                  .map((b) =>
                    b.id === input.draggableId
                      ? { ...b, order: input.itemTwoIndex }
                      : input.itemOneIndex > input.itemTwoIndex &&
                        b.order >= input.itemTwoIndex &&
                        b.order <= input.itemOneIndex
                      ? { ...b, order: b.order + 1 }
                      : input.itemOneIndex < input.itemTwoIndex &&
                        b.order <= input.itemTwoIndex &&
                        b.order >= input.itemOneIndex
                      ? { ...b, order: b.order - 1 }
                      : b
                  )
                  .sort((a, b) => a.order - b.order),
              }
            : p
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      counter.current -= 1
      counter.current === 0 && utils.project.getByUser.invalidate()
    },
  })

export const deleteOneBoard = (
  projectId: string,
  utils: TRPCContextType,
  unselectBoard: () => void,
  counter: React.MutableRefObject<number>
) =>
  trpc.board.delete.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      unselectBoard()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.filter((b) => b.id !== input),
              }
            : p
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      counter.current -= 1
      counter.current === 0 && utils.project.getByUser.invalidate()
    },
  })
