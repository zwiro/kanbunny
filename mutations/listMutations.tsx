import { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"
import { UseFormReturn } from "react-hook-form"

export const updateListName = (
  boardId: string,
  utils: TRPCContextType,
  closeEditName: () => void
) =>
  trpc.list.editName.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) => (l.id === input.id ? { ...l, name: input.name } : l))
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled: () => {
      utils.list.getByBoard.invalidate(boardId)
      closeEditName()
    },
  })

export const updateListColor = (
  boardId: string,
  utils: TRPCContextType,
  closeEditColor: () => void
) =>
  trpc.list.editColor.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) => (l.id === input.id ? { ...l, color: input.color } : l))
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

export const deleteOneList = (boardId: string, utils: TRPCContextType) =>
  trpc.list.delete.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.filter((list) => list.id !== input)
      )
      return { prevData }
    },
    onError(err, updatedList, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      utils.list.getByBoard.invalidate(boardId)
    },
  })

export const createNewList = (
  boardId: string,
  utils: TRPCContextType,
  closeAdd: () => void,
  listMethods: UseFormReturn<
    {
      name: string
      boardId: string
    },
    any
  >
) =>
  trpc.list.create.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(
        boardId,
        (old) => [...old!, { ...input, tasks: [], color: "blue" }] as any
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      listMethods.reset()
      closeAdd()
      utils.list.getByBoard.invalidate()
    },
  })

export const reorderLists = (boardId: string, utils: TRPCContextType) =>
  trpc.list.reorder.useMutation({
    async onMutate(input) {
      await utils.list.getByBoard.cancel()
      const prevData = utils.list.getByBoard.getData()
      utils.list.getByBoard.setData(boardId, (old) =>
        old?.map((l) =>
          l.id === input.draggableId
            ? { ...l, order: input.itemTwoIndex }
            : input.itemOneIndex > input.itemTwoIndex &&
              l.order >= input.itemTwoIndex &&
              l.order <= input.itemOneIndex
            ? { ...l, order: l.order + 1 }
            : input.itemOneIndex < input.itemTwoIndex &&
              l.order <= input.itemTwoIndex &&
              l.order >= input.itemOneIndex
            ? { ...l, order: l.order - 1 }
            : l
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.list.getByBoard.setData(boardId, ctx?.prevData)
    },
    onSettled() {
      utils.list.getByBoard.invalidate()
    },
  })