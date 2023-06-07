import PlusIcon from "./PlusIcon"
import { AnimatePresence, motion } from "framer-motion"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import useBooleanState from "@/hooks/useBooleanState"
import React, { useContext } from "react"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import useAddUser from "@/hooks/useAddUser"
import { trpc } from "@/utils/trpc"
import type { Project } from "@prisma/client"
import { LoadingDots } from "./LoadingDots"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Board from "./Board"
import LayoutContext from "@/context/LayoutContext"
import { boardAndProjectSchema } from "@/utils/schemas"
import { GoGrabber } from "react-icons/go"
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import useExpand from "@/hooks/useExpand"
import {
  deleteOneProject,
  updateProjectName,
  updateProjectUsers,
} from "@/mutations/projectMutations"
import { createNewBoard, reorderBoards } from "@/mutations/boardMutations"

interface ProjectProps {
  project: Project & { boards: Board[] }
  boards: Board[]
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

type BoardAndProjectSchema = z.infer<typeof boardAndProjectSchema>

function Project({ project, boards, dragHandleProps }: ProjectProps) {
  trpc.project.getUsers.useQuery(project.id, {
    onSuccess(data) {
      setAllUsers(data?.map((user) => user.name!))
    },
  })

  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingUsers, editUsers, closeEditUsers] = useBooleanState()

  const { isExpanded, toggle } = useExpand()

  const [isAdding, add, closeAdd] = useBooleanState()
  const { user, users, addUser, removeUser, handleChange, setAllUsers } =
    useAddUser()

  const { chosenBoardId } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const updateUsers = updateProjectUsers(utils)
  const updateName = updateProjectName(utils, closeEditName)
  const deleteProject = deleteOneProject(utils)

  const boardMethods = useForm<BoardAndProjectSchema>({
    defaultValues: { projectId: project.id },
    resolver: zodResolver(boardAndProjectSchema),
  })

  const createBoard = createNewBoard(utils, closeAdd, boardMethods)

  const projectMethods = useForm<BoardAndProjectSchema>({
    defaultValues: { projectId: project.id, name: project.name },
    resolver: zodResolver(boardAndProjectSchema),
  })

  const onSubmit: SubmitHandler<BoardAndProjectSchema> = (data: any) => {
    createBoard.mutate({ name: data.name, projectId: project.id })
  }

  const onSubmitName: SubmitHandler<BoardAndProjectSchema> = (data: any) => {
    updateName.mutate({ name: data.name, projectId: project.id })
  }

  const handleSubmitUsers = (e: React.FormEvent) => {
    e.preventDefault()
    updateUsers.mutate({ projectId: project.id, participants: users })
  }

  const projectUsersAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  }

  const reorder = reorderBoards(project.id, utils)

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

  return (
    <section className="my-4 border-b border-neutral-700">
      {!isEditingName ? (
        <div className="flex items-center gap-4">
          <p
            className={`relative after:absolute after:-bottom-1 after:left-0 after:z-10 after:h-1 after:w-0 after:bg-white after:transition-all ${
              project.boards.map((b) => b.id).includes(chosenBoardId!) &&
              "after:w-[100%]"
            }`}
          >
            {project.name}
          </p>
          <MenuWrapper>
            <MenuItem handleClick={add}>add board</MenuItem>
            <MenuItem handleClick={editUsers}>edit users</MenuItem>
            <MenuItem handleClick={editName}>edit project name</MenuItem>
            <MenuItem handleClick={() => deleteProject.mutate(project.id)}>
              delete project
            </MenuItem>
          </MenuWrapper>

          <div {...dragHandleProps} className="ml-auto cursor-grab">
            <GoGrabber />
          </div>
        </div>
      ) : (
        <div className="pt-1.5">
          <FormProvider {...projectMethods}>
            <AddEditForm
              name="name"
              placeholder="project name"
              handleSubmit={projectMethods.handleSubmit(onSubmitName)}
              defaultValue={project.name}
              isLoading={updateName.isLoading}
              close={closeEditName}
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
              <div className="flex items-center gap-2">
                <input
                  id="user"
                  type="text"
                  placeholder="johndoe211"
                  className="w-44 border bg-zinc-900 p-1 text-xl"
                  value={user}
                  onChange={handleChange}
                />
                <button onClick={addUser} className="group">
                  <PlusIcon />
                </button>
              </div>
              <p>participating ({users.length})</p>
              <ul className="flex flex-wrap gap-2">
                {users.map((user, i) => (
                  <li
                    key={`${user}-${i}`}
                    onClick={() => removeUser(user)}
                    className="cursor-pointer border border-zinc-900 bg-zinc-900 p-2 transition-colors hover:bg-transparent"
                  >
                    {user}
                  </li>
                ))}
              </ul>
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
                  isLoading={createBoard.isLoading}
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
                      .map((board) => (
                        <Draggable
                          key={board.id}
                          draggableId={board.id}
                          index={board.order}
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
                                  {...board}
                                  isDragging={snapshot.isDragging}
                                  dragHandleProps={provided.dragHandleProps}
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
