import React, { useContext, useRef } from "react"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { GoGrabber } from "react-icons/go"
import { z } from "zod"
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"
import { AnimatePresence } from "framer-motion"
import type { Board, Color } from "@prisma/client"
import { trpc } from "@/utils/trpc"
import { boardSchema } from "@/utils/schemas"
import LayoutContext from "@/context/LayoutContext"
import useBooleanState from "@/hooks/useBooleanState"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import ColorPicker from "./ColorPicker"
import ColorDot from "./ColorDot"
import {
  deleteOneBoard,
  updateBoardColor,
  updateBoardName,
} from "@/mutations/boardMutations"
import ConfirmPopup from "./ConfirmPopup"

interface BoardProps {
  name: string
  color: Color
  id: string
  owner: string
  projectId: string
  dragHandleProps: DraggableProvidedDragHandleProps | null
  isDragging: boolean
  isUpdating: boolean
  mutationCounter: React.MutableRefObject<number>
}

function Board({
  name,
  color,
  id,
  owner,
  projectId,
  dragHandleProps,
  isDragging,
  isUpdating,
  mutationCounter,
}: BoardProps) {
  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingColor, editColor, closeEditColor] = useBooleanState()
  const [isPopupOpened, openPopup, closePopup] = useBooleanState()

  const { chosenBoard, chooseOpenedBoard } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const unselectBoard = () => {
    if (chosenBoard?.id === id) {
      chooseOpenedBoard(undefined)
    }
  }

  const updateName = updateBoardName(
    projectId,
    utils,
    closeEditName,
    mutationCounter
  )
  const updateColor = updateBoardColor(
    projectId,
    utils,
    closeEditColor,
    mutationCounter
  )
  const deleteBoard = deleteOneBoard(
    projectId,
    utils,
    unselectBoard,
    mutationCounter
  )

  type BoardSchema = z.infer<typeof boardSchema>

  const boardMethods = useForm<BoardSchema>({
    defaultValues: { name, id },
    resolver: zodResolver(boardSchema),
  })

  const onSubmit: SubmitHandler<BoardSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id })
  }

  const isLoading = isUpdating || updateName.isLoading || updateColor.isLoading

  return (
    <li
      onClick={() => chooseOpenedBoard({ id, color, name, owner })}
      className={`group flex cursor-pointer items-center gap-2 px-2 text-xl transition-colors hover:bg-zinc-900/40 ${
        chosenBoard?.id === id && id && "bg-zinc-900 hover:bg-zinc-900/100"
      } ${
        ((isUpdating && !id) ||
          updateName.isLoading ||
          updateColor.isLoading) &&
        "opacity-50"
      }
      `}
    >
      <ColorDot editColor={editColor} color={color}>
        <AnimatePresence>
          {isEditingColor && (
            <ColorPicker
              id={id}
              close={closeEditColor}
              editColor={updateColor}
              currentColor={color}
            />
          )}
        </AnimatePresence>
      </ColorDot>
      {!isEditingName ? (
        <>
          <div>{name}</div>
          <div
            className={`invisible z-10 scale-0 transition-transform ${
              isEditingColor
                ? "group-hover:scale-0"
                : "group-hover:visible group-hover:scale-100"
            } `}
          >
            <MenuWrapper isLoading={isLoading}>
              <MenuItem handleClick={editName}>edit board name</MenuItem>
              <MenuItem handleClick={editColor}>change color</MenuItem>
              <MenuItem handleClick={openPopup}>delete board</MenuItem>
            </MenuWrapper>
          </div>
          <AnimatePresence>
            {isPopupOpened && (
              <ConfirmPopup
                name={name}
                type="board"
                handleClick={() => deleteBoard.mutate(id)}
                close={() => closePopup()}
              />
            )}
          </AnimatePresence>
          <div
            {...dragHandleProps}
            className={`ml-auto cursor-grab group-hover:visible ${
              isDragging ? "visible" : "invisible"
            }`}
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
