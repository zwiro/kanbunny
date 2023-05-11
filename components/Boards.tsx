import { AnimatePresence } from "framer-motion"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import React from "react"
import ColorPicker from "./ColorPicker"
import { trpc } from "@/utils/trpc"
import type { Board } from "@prisma/client"
import { LoadingDots } from "./LoadingDots"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

interface BoardProps {
  name: string
  color: string
  id: string
  projectId: string
}

export const boardSchema = z.object({
  name: z.string().min(1, { message: "board name is required" }),
  projectId: z.string(),
  id: z.string(),
})

type BoardSchema = z.infer<typeof boardSchema>

function Board({ name, color, id, projectId }: BoardProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingColor, editColor, closeEditColor] = useAddOrEdit()

  const boardMethods = useForm<BoardSchema>({
    defaultValues: { name, id, projectId },
    resolver: zodResolver(boardSchema),
  })

  const utils = trpc.useContext()

  const updateName = trpc.board.editName.useMutation({
    async onMutate(updatedBoard) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.map((b) =>
                  b.id === updatedBoard.id
                    ? { ...b, name: updatedBoard.name }
                    : b
                ),
              }
            : p
        )
      )
      return { prevData }
    },
    onError(err, updatedBoard, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
      closeEditName()
    },
  })

  const deleteBoard = trpc.board.delete.useMutation({
    async onMutate(deletedBoardId) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.filter((b) => b.id !== deletedBoardId),
              }
            : p
        )
      )
      return { prevData }
    },
    onError(err, updatedBoard, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
    },
  })

  const onSubmit: SubmitHandler<BoardSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id, projectId })
  }

  return (
    <li className="group flex items-center gap-2 text-xl">
      <div
        onClick={editColor}
        className={`relative h-4 w-4 cursor-pointer rounded-full bg-${color}-500`}
      >
        <AnimatePresence>
          {isEditingColor && (
            <ColorPicker id={id} projectId={projectId} close={closeEditColor} />
          )}
        </AnimatePresence>
      </div>
      {!isEditingName ? (
        <>
          <p>{!deleteBoard.isLoading ? name : <LoadingDots />}</p>
          <div
            className={`z-10 scale-0 transition-transform ${
              isEditingColor ? "group-hover:scale-0" : "group-hover:scale-100"
            } `}
          >
            <MenuButton>
              <MenuItem handleClick={editName}>edit board name</MenuItem>
              <MenuItem handleClick={editColor}>change color</MenuItem>
              <MenuItem handleClick={() => deleteBoard.mutate(id)}>
                delete board
              </MenuItem>
            </MenuButton>
          </div>
        </>
      ) : (
        <div>
          <FormProvider {...boardMethods}>
            <AddEditForm
              name="name"
              placeholder="board name"
              close={closeEditName}
              handleSubmit={boardMethods.handleSubmit(onSubmit)}
              isLoading={updateName.isLoading}
            />
          </FormProvider>
          {boardMethods.formState.errors && (
            <p role="alert" className="text-base text-red-500">
              {boardMethods.formState.errors?.name?.message as string}
            </p>
          )}
        </div>
      )}
    </li>
  )
}

export default Board
