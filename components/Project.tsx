import { AnimatePresence, motion } from "framer-motion"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import useBooleanState from "@/hooks/useBooleanState"
import React, { useContext, useRef, useState } from "react"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import { trpc } from "@/utils/trpc"
import type { Project, User } from "@prisma/client"
import { LoadingDots } from "./LoadingDots"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Board from "./Board"
import LayoutContext from "@/context/LayoutContext"
import { boardAndProjectSchema } from "@/utils/schemas"
import { GoGrabber } from "react-icons/go"
import {
  DragDropContext,
  Draggable,
  type DraggableProvidedDragHandleProps,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import {
  deleteOneProject,
  leaveOneProject,
  updateProjectName,
  updateProjectUsers,
} from "@/mutations/projectMutations"
import { createNewBoard, reorderBoards } from "@/mutations/boardMutations"
import { useSession } from "next-auth/react"
import ConfirmPopup from "./ConfirmPopup"
import UserSelect from "./UserSelect"

interface ProjectProps {
  boards: Board[]
  id: string
  name: string
  owner: User
  dragHandleProps: DraggableProvidedDragHandleProps | null
  mutationCounter: React.MutableRefObject<number>
}

type BoardAndProjectSchema = z.infer<typeof boardAndProjectSchema>

function Project({
  id,
  name,
  boards,
  owner,
  dragHandleProps,
  mutationCounter,
}: ProjectProps) {
  trpc.project.getUsers.useQuery(id, {
    onSuccess(data) {
      setSelectedUsers(data?.map((user) => user.name!))
    },
  })
  const { data: session, status } = useSession()
  const isOwner = session?.user?.id === owner.id

  const [isLeaving, setIsLeaving] = useState(false)

  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingUsers, editUsers, closeEditUsers] = useBooleanState()
  const [isPopupOpened, openPopup, closePopup] = useBooleanState()

  const [isAdding, add, closeAdd] = useBooleanState()

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const { chosenBoard } = useContext(LayoutContext)

  const boardMutationCounter = useRef(0)

  const utils = trpc.useContext()

  const updateUsers = updateProjectUsers(utils)
  const updateName = updateProjectName(utils, closeEditName, mutationCounter)
  const deleteProject = deleteOneProject(utils, mutationCounter)
  const leaveProject = leaveOneProject(utils, mutationCounter)

  const boardMethods = useForm<BoardAndProjectSchema>({
    defaultValues: { projectId: id },
    resolver: zodResolver(boardAndProjectSchema),
  })

  const createBoard = createNewBoard(utils, closeAdd, boardMethods)

  const projectMethods = useForm<BoardAndProjectSchema>({
    defaultValues: { projectId: id, name },
    resolver: zodResolver(boardAndProjectSchema),
  })

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

  const reorder = reorderBoards(id, utils, boardMutationCounter)

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || source.index === destination.index) {
      return
    }
    reorder.mutate({
      itemOneIndex: source.index,
      itemTwoIndex: destination.index,
      draggableId,
    })
  }

  const isLoading = createBoard.isLoading || updateName.isLoading

  return (
    <section className="my-4 border-b border-neutral-700">
      {!isEditingName ? (
        <div className="flex items-center gap-4">
          <p
            className={`relative after:absolute after:-bottom-1 after:left-0 after:z-10 after:h-1 after:w-0 after:bg-white after:transition-all ${
              boards.map((b) => b.id).includes(chosenBoard?.id!) &&
              chosenBoard &&
              "after:w-[100%]"
            } ${updateName.isLoading && "opacity-50"}`}
          >
            {name}
          </p>
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
          <div {...dragHandleProps} className="ml-auto cursor-grab">
            <GoGrabber />
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
              className="pt-[3px]"
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
            className="flex flex-col gap-2 pt-4 text-base"
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
                    >
                      <AiOutlineCheck size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={closeEditUsers}
                      className="transition-transform hover:scale-110"
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  </>
                ) : (
                  <div className="mr-auto h-6">
                    <LoadingDots />
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <ul className="flex flex-col gap-2 py-4 lg:gap-4">
        {isAdding && (
          <>
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
          </>
        )}
        <AnimatePresence>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="projects">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {!!boards.length &&
                    boards
                      ?.sort((a, b) => a.order - b.order)
                      .map((board, i) => (
                        <Draggable
                          key={`board-${i}-${board.id}`}
                          draggableId={board.id || `placeholder-${i}`}
                          index={board.order}
                          isDragDisabled={createBoard.isLoading}
                        >
                          {(provided, snapshot) => (
                            <div
                              className="draggable"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <motion.div
                                animate={{
                                  rotate: snapshot.isDragging ? -5 : 0,
                                }}
                              >
                                <Board
                                  key={board.id}
                                  isDragging={snapshot.isDragging}
                                  dragHandleProps={provided.dragHandleProps}
                                  isUpdating={createBoard.isLoading}
                                  owner={owner.name!}
                                  mutationCounter={boardMutationCounter}
                                  {...board}
                                />
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </AnimatePresence>
        {!boards.length && (
          <p className="text-base font-bold text-neutral-500">no boards yet</p>
        )}
      </ul>
    </section>
  )
}

export default Project
