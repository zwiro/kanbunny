import { useContext } from "react"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { GoGrabber } from "react-icons/go"
import { z } from "zod"
import { AnimatePresence } from "framer-motion"
import { isMobile } from "react-device-detect"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { trpc } from "@/utils/trpc"
import type { Board, Color } from "@prisma/client"
import { boardSchema } from "@/utils/schemas"
import {
  deleteOneBoard,
  updateBoardColor,
  updateBoardName,
} from "@/mutations/boardMutations"
import LayoutContext from "@/context/LayoutContext"
import useBooleanState from "@/hooks/useBooleanState"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import ColorPicker from "./ColorPicker"
import ColorDot, { ColorDotButton } from "./ColorDot"
import ConfirmPopup from "./ConfirmPopup"

interface BoardProps {
  name: string
  color: Color
  id: string
  owner: string
  projectId: string
  isUpdating: boolean
  mutationCounter: React.MutableRefObject<number>
  isReordering: boolean
}

function Board({
  name,
  color,
  id,
  owner,
  projectId,
  isUpdating,
  mutationCounter,
  isReordering,
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

  const isLoading =
    updateName.isLoading ||
    updateColor.isLoading ||
    deleteBoard.isLoading ||
    isReordering

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isLoading || isUpdating,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      tabIndex={0}
      onClick={
        !isLoading || !isUpdating
          ? () => chooseOpenedBoard({ id, color, name, owner })
          : undefined
      }
      onKeyDown={(e) =>
        e.key === "Enter" && chooseOpenedBoard({ id, color, name, owner })
      }
      className={`group flex cursor-pointer items-center gap-2 px-2 text-xl transition-colors ${
        chosenBoard?.id === id && id
          ? "bg-zinc-900 hover:bg-zinc-900 focus:bg-zinc-900"
          : "hover:bg-zinc-900/40 focus:bg-zinc-900/40"
      } ${isUpdating && id.startsWith("temp") && "opacity-50"}
      ${isLoading && "opacity-50"}
      `}
    >
      <ColorDot>
        <AnimatePresence>
          {isEditingColor ? (
            <ColorPicker
              id={id}
              close={closeEditColor}
              editColor={updateColor}
              currentColor={color}
            />
          ) : (
            <ColorDotButton
              editColor={editColor}
              color={color}
              disabled={isLoading || isUpdating}
            />
          )}
        </AnimatePresence>
      </ColorDot>
      {!isEditingName ? (
        <>
          <h3 className="max-w-[75%] break-words">{name}</h3>
          <div className="ml-auto flex items-center self-start">
            <div
              className={`z-10 transition-transform
              ${isMobile ? "visible scale-100" : "invisible scale-0"}
              ${
                isEditingColor
                  ? "group-hover:scale-0 group-focus:scale-0"
                  : "group-focus-within:visible group-focus-within:scale-100 group-hover:visible group-hover:scale-100 group-focus:visible group-focus:scale-100 peer-focus:visible peer-focus:scale-100"
              }`}
            >
              <MenuWrapper isLoading={isLoading || isUpdating}>
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
            <button
              {...listeners}
              disabled={isLoading || isUpdating}
              ref={setActivatorNodeRef}
              aria-label="Grab to drag"
              tabIndex={0}
              className={`ml-auto group-focus-within:visible group-hover:visible ${
                isDragging ? "visible" : !isMobile && "invisible"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <GoGrabber />
            </button>
          </div>
        </>
      ) : (
        <div>
          <FormProvider {...boardMethods}>
            <AddEditForm
              name="name"
              placeholder="board name"
              handleSubmit={boardMethods.handleSubmit(onSubmit)}
              defaultValue={name}
              close={closeEditName}
              className="[&>input]:h-9"
            />
          </FormProvider>
          {boardMethods.formState.errors && (
            <p role="alert" className="text-base text-red-500">
              {boardMethods.formState.errors?.name?.message as string}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Board
