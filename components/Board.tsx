import { AnimatePresence } from "framer-motion"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import React, { useContext } from "react"
import ColorPicker from "./ColorPicker"
import { trpc } from "@/utils/trpc"
import type { Board, Color } from "@prisma/client"
import { LoadingDots } from "./LoadingDots"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import LayoutContext from "@/context/LayoutContext"
import ColorDot from "./ColorDot"
import { boardSchema } from "@/types/schemas"
import { GoGrabber } from "react-icons/go"
import { motion } from "framer-motion"

interface BoardProps {
  name: string
  color: Color
  id: string
  projectId: string
}

function Board({ name, color, id, projectId }: BoardProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingColor, editColor, closeEditColor] = useAddOrEdit()

  const { chosenBoardId, chooseOpenedBoard } = useContext(LayoutContext)

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

  const updateColor = trpc.board.editColor.useMutation({
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
                    ? { ...b, color: updatedBoard.color }
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
    onSettled: () => {
      closeEditColor()
      utils.project.getByUser.invalidate()
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

  type BoardSchema = z.infer<typeof boardSchema>

  const boardMethods = useForm<BoardSchema>({
    defaultValues: { name, id },
    resolver: zodResolver(boardSchema),
  })

  const onSubmit: SubmitHandler<BoardSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id })
  }

  return (
    <motion.li
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      onClick={() => chooseOpenedBoard(id)}
      className={`group flex cursor-pointer items-center gap-2 px-2 text-xl transition-colors hover:bg-zinc-900/40 ${
        chosenBoardId === id && "bg-zinc-900 hover:bg-zinc-900/100"
      } `}
    >
      <ColorDot editColor={editColor} color={color}>
        <AnimatePresence>
          {isEditingColor && (
            <ColorPicker
              id={id}
              close={closeEditColor}
              editColor={updateColor}
            />
          )}
        </AnimatePresence>
      </ColorDot>
      {!isEditingName ? (
        <>
          <p>{!deleteBoard.isLoading ? name : <LoadingDots />}</p>

          <div
            className={`invisible z-10 scale-0 transition-transform ${
              isEditingColor
                ? "group-hover:scale-0"
                : "group-hover:visible group-hover:scale-100"
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
          <div
            className="invisible ml-auto cursor-grab group-hover:visible"
            onClick={(e) => e.stopPropagation()}
          >
            <GoGrabber />
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
    </motion.li>
  )
}

export default Board
