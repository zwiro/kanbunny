import { useContext, useRef, useState } from "react"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { AnimatePresence, motion } from "framer-motion"
import type { Project, User } from "@prisma/client"
import { trpc } from "@/utils/trpc"
import { z } from "zod"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoadingDots } from "./LoadingDots"
import { boardAndProjectSchema } from "@/utils/schemas"
import { GoGrabber } from "react-icons/go"
import {
  deleteOneProject,
  leaveOneProject,
  updateProjectName,
  updateProjectUsers,
} from "@/mutations/projectMutations"
import { createNewBoard, reorderBoards } from "@/mutations/boardMutations"
import LayoutContext from "@/context/LayoutContext"
import useBooleanState from "@/hooks/useBooleanState"
import Board from "./Board"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import ConfirmPopup from "./ConfirmPopup"
import UserSelect from "./UserSelect"

interface ProjectProps {
  boards: Board[]
  id: string
  name: string
  owner: User
  mutationCounter: React.MutableRefObject<number>
}

type BoardAndProjectSchema = z.infer<typeof boardAndProjectSchema>

function Project({ id, name, boards, owner, mutationCounter }: ProjectProps) {
  trpc.project.getUsers.useQuery(id, {
    onSuccess(data) {
      setSelectedUsers(data?.map((user) => user.name!))
    },
  })

  const { data: session } = useSession()

  const isOwner = session?.user?.id === owner.id

  const [isLeaving, setIsLeaving] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingUsers, editUsers, closeEditUsers] = useBooleanState()
  const [isPopupOpened, openPopup, closePopup] = useBooleanState()
  const [isAdding, add, closeAdd] = useBooleanState()

  const { chosenBoard, chooseOpenedBoard } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const boardMethods = useForm<BoardAndProjectSchema>({
    defaultValues: { projectId: id },
    resolver: zodResolver(boardAndProjectSchema),
  })

  const projectMethods = useForm<BoardAndProjectSchema>({
    defaultValues: { projectId: id, name },
    resolver: zodResolver(boardAndProjectSchema),
  })

  const boardMutationCounter = useRef(0)

  const unselectBoard = () => {
    if (boards.map((b) => b.id).includes(chosenBoard?.id!)) {
      chooseOpenedBoard(undefined)
    }
  }

  const updateUsers = updateProjectUsers(utils)
  const updateName = updateProjectName(utils, closeEditName, mutationCounter)
  const deleteProject = deleteOneProject(utils, mutationCounter, unselectBoard)
  const leaveProject = leaveOneProject(utils, mutationCounter, unselectBoard)
  const createBoard = createNewBoard(utils, closeAdd, boardMethods)
  const reorder = reorderBoards(id, utils, boardMutationCounter)

  const onSubmit: SubmitHandler<BoardAndProjectSchema> = (data: any) => {
    createBoard.mutate({ name: data.name, projectId: id })
  }

  const onSubmitName: SubmitHandler<BoardAndProjectSchema> = (data: any) => {
    updateName.mutate({ name: data.name, projectId: id })
  }

  const handleSubmitUsers = (e: React.FormEvent) => {
    e.preventDefault()
    updateUsers.mutate({ projectId: id, participants: selectedUsers })
    closeEditUsers()
  }

  const projectUsersAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over) return
    if (active.id !== over.id) {
      return reorder.mutate({
        itemOneIndex: active.data.current!.sortable.index,
        itemTwoIndex: over.data.current!.sortable.index,
        draggableId: active.id as string,
      })
    }
  }

  const isLoading = createBoard.isLoading || updateName.isLoading

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  return (
    <section
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="my-4 cursor-default border-b border-neutral-700"
    >
      {!isEditingName ? (
        <div className="flex gap-4 pb-4">
          <h2
            className={`relative max-w-[80%] break-words text-lg after:absolute after:-bottom-1 after:left-0 after:h-1 after:w-0 after:bg-white after:transition-all lg:text-2xl ${
              boards.map((b) => b.id).includes(chosenBoard?.id!) &&
              chosenBoard &&
              "after:w-[100%]"
            } ${updateName.isLoading && "opacity-50"}`}
          >
            {name}
          </h2>
          <div className="ml-auto flex items-center self-start">
            <MenuWrapper isLoading={isLoading}>
              <MenuItem handleClick={add}>add board</MenuItem>
              {!isOwner && (
                <MenuItem
                  handleClick={() => {
                    setIsLeaving(true)
                    openPopup()
                  }}
                >
                  leave project
                </MenuItem>
              )}
              {isOwner && (
                <>
                  <MenuItem handleClick={editUsers}>edit users</MenuItem>
                  <MenuItem handleClick={editName}>edit project name</MenuItem>
                  <MenuItem handleClick={openPopup}>delete project</MenuItem>
                </>
              )}
            </MenuWrapper>
            <AnimatePresence>
              {!isLeaving ? (
                isPopupOpened && (
                  <ConfirmPopup
                    name={name}
                    type="project"
                    handleClick={() => deleteProject.mutate(id)}
                    close={() => closePopup()}
                  />
                )
              ) : (
                <ConfirmPopup
                  name={name}
                  type="project"
                  action="leave"
                  handleClick={() => leaveProject.mutate(id)}
                  close={() => {
                    setIsLeaving(false)
                    closePopup()
                  }}
                />
              )}
            </AnimatePresence>
            <div
              {...listeners}
              ref={setActivatorNodeRef}
              className="ml-auto cursor-grab"
              aria-label="Grab to drag"
              tabIndex={0}
            >
              <GoGrabber />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <FormProvider {...projectMethods}>
            <AddEditForm
              name="name"
              placeholder="project name"
              handleSubmit={projectMethods.handleSubmit(onSubmitName)}
              defaultValue={name}
              close={closeEditName}
              className="pb-4 pt-[5px]"
            />
          </FormProvider>
          {projectMethods.formState.errors && (
            <p role="alert" className="text-base text-red-500">
              {projectMethods.formState.errors?.name?.message as string}
            </p>
          )}
        </div>
      )}
      <AnimatePresence>
        {isEditingUsers && (
          <motion.div
            {...projectUsersAnimation}
            className="flex flex-col gap-2 text-base"
          >
            <form onSubmit={handleSubmitUsers} className="flex flex-col gap-2">
              <p>
                {selectedUsers.length} participant
                {selectedUsers.length === 1 ? "" : "s"}
              </p>
              <UserSelect
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />
              <div className="flex items-center gap-1">
                {!updateUsers.isLoading ? (
                  <>
                    <button
                      type="submit"
                      className="transition-transform hover:scale-110 disabled:hover:scale-100"
                      aria-label="Submit users"
                    >
                      <AiOutlineCheck size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={closeEditUsers}
                      className="transition-transform hover:scale-110"
                      aria-label="Cancel"
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  </>
                ) : (
                  <div className="mr-auto h-6">
                    <LoadingDots className="ml-auto" />
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAdding && (
          <motion.div {...projectUsersAnimation}>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-red-500" />
              <FormProvider {...boardMethods}>
                <AddEditForm
                  name="name"
                  placeholder="board name"
                  handleSubmit={boardMethods.handleSubmit(onSubmit)}
                  close={closeAdd}
                />
              </FormProvider>
            </div>
            {boardMethods.formState.errors && (
              <p role="alert" className="pl-6 text-base text-red-500">
                {boardMethods.formState.errors?.name?.message as string}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col py-4">
        <AnimatePresence>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={boards.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
              disabled={createBoard.isLoading}
            >
              {boards?.map((board) => (
                <Board
                  key={board.id}
                  isUpdating={createBoard.isLoading}
                  owner={owner.name!}
                  mutationCounter={boardMutationCounter}
                  {...board}
                />
              ))}
            </SortableContext>
          </DndContext>
        </AnimatePresence>
        {!boards.length && (
          <p className="text-base font-bold text-neutral-300">no boards yet</p>
        )}
      </div>
    </section>
  )
}

export default Project as React.FC<ProjectProps>
