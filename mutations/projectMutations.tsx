import { TRPCContextType } from "@/types/trpc"
import { trpc } from "@/utils/trpc"

export const createNewProject = (utils: TRPCContextType) =>
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
  closeEditName: () => void
) =>
  trpc.project.editName.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === input.projectId ? { ...p, name: input.name } : p
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

export const deleteOneProject = (utils: TRPCContextType) =>
  trpc.project.delete.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
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
      utils.project.getByUser.invalidate()
    },
  })

export const reorderProjects = (utils: TRPCContextType) =>
  trpc.project.reorder.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
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
      utils.project.getByUser.invalidate()
    },
  })
