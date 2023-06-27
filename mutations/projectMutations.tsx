import type { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"

export const createNewProject = (utils: TRPCContextType, close: () => void) =>
  trpc.project.create.useMutation({
    onSuccess() {
      utils.project.getByUser.invalidate()
      close()
    },
  })

export const updateProjectUsers = (utils: TRPCContextType) =>
  trpc.project.editUsers.useMutation({
    onSuccess() {
      utils.project.getUsers.invalidate()
    },
  })

export const updateProjectName = (
  utils: TRPCContextType,
  closeEditName: () => void,
  counter: React.MutableRefObject<number>
) =>
  trpc.project.editName.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === input.projectId ? { ...p, name: input.name } : p
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

export const reorderProjects = (
  utils: TRPCContextType,
  counter: React.MutableRefObject<number>
) =>
  trpc.project.reorder.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === input.draggableId
            ? { ...p, order: input.itemTwoIndex }
            : input.itemOneIndex > input.itemTwoIndex &&
              p.order >= input.itemTwoIndex &&
              p.order <= input.itemOneIndex
            ? { ...p, order: p.order + 1 }
            : input.itemOneIndex < input.itemTwoIndex &&
              p.order <= input.itemTwoIndex &&
              p.order >= input.itemOneIndex
            ? { ...p, order: p.order - 1 }
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

export const leaveOneProject = (
  utils: TRPCContextType,
  counter: React.MutableRefObject<number>
) =>
  trpc.project.leave.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.filter((p) => p.id !== input)
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

export const deleteOneProject = (
  utils: TRPCContextType,
  counter: React.MutableRefObject<number>
) =>
  trpc.project.delete.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      counter.current += 1
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.filter((p) => p.id !== input)
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
