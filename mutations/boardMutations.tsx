import { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"
import { Board } from "@prisma/client"
import { UseFormReturn } from "react-hook-form"

export const updateBoardName = (
  projectId: string,
  utils: TRPCContextType,
  closeEditName: () => void
) =>
  trpc.board.editName.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
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
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
      closeEditName()
    },
  })

export const updateBoardColor = (
  projectId: string,
  utils: TRPCContextType,
  closeEditColor: () => void
) =>
  trpc.board.editColor.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
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
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled: () => {
      closeEditColor()
      utils.project.getByUser.invalidate()
    },
  })

export const deleteOneBoard = (
  projectId: string,
  utils: TRPCContextType,
  unselectBoard: () => void
) =>
  trpc.board.delete.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
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
      utils.project.getByUser.invalidate()
    },
  })

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
                  { ...input, color: "red", order: 0 } as Board,
                  ...p.boards,
                ],
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
      utils.project.getByUser.invalidate()
      closeAdd()
      boardMethods.reset()
    },
  })

export const reorderBoards = (projectId: string, utils: TRPCContextType) =>
  trpc.board.reorder.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.map((b) =>
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
                ),
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
      utils.project.getByUser.invalidate()
    },
  })
