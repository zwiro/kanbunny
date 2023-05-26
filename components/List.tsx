import { useContext } from "react"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import AddEditForm from "./AddEditForm"
import AddTaskModal from "./AddTaskModal"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import { AnimatePresence, color, motion } from "framer-motion"
import ColorPicker from "./ColorPicker"
import UserCheckbox from "./UserCheckbox"
import type { List as ListType, Prisma, Task } from "@prisma/client"
import ColorDot from "./ColorDot"
import { trpc } from "@/utils/trpc"
import LayoutContext from "@/context/LayoutContext"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import useAssignUser from "@/hooks/useAssignUser"
import { editListSchema, editTaskSchema } from "@/types/schemas"
import { GoGrabber } from "react-icons/go"
import {
  DragDropContext,
  Draggable,
  DraggableProvidedDragHandleProps,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd"

type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>

interface ListProps extends ListType {
  tasks: TaskWithAssignedTo[]
  dragHandleProps: DraggableProvidedDragHandleProps | null
}

const colorVariants = {
  blue: "border-blue-500",
  red: "border-red-500",
  yellow: "border-yellow-500",
  green: "border-green-500",
  pink: "border-pink-500",
}

function List({
  name,
  color,
  tasks,
  id,
  boardId,
  order,
  dragHandleProps,
}: ListProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingColor, editColor, closeEditColor] = useAddOrEdit()
  const [isAdding, add, closeAdd] = useAddOrEdit()

  const { chosenBoardId } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const updateName = trpc.list.editName.useMutation({
    async onMutate(updatedList) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        boardId,
        (old) =>
          ({
            ...old,
            lists: old?.lists!.map((l) =>
              l.id === updatedList.id ? { ...l, name: updatedList.name } : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, updatedList, ctx) {
      utils.board.getById.setData(boardId, ctx?.prevData)
    },
    onSettled: () => {
      utils.board.getById.invalidate(boardId)
      closeEditName()
    },
  })

  const updateColor = trpc.list.editColor.useMutation({
    async onMutate(updatedList) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        boardId,
        (old) =>
          ({
            ...old,
            lists: old?.lists!.map((l) =>
              l.id === updatedList.id ? { ...l, color: updatedList.color } : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, updatedList, ctx) {
      utils.board.getById.setData(boardId, ctx?.prevData)
    },
    onSettled: () => {
      utils.board.getById.invalidate(boardId)
      closeEditColor()
    },
  })

  const deleteList = trpc.list.delete.useMutation({
    async onMutate(deletedListId) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: old?.lists!.filter((list) => list.id !== deletedListId),
          } as any)
      )
      return { prevData }
    },
    onError(err, updatedList, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      utils.board.getById.invalidate(boardId)
    },
  })

  type ListSchema = z.infer<typeof editListSchema>

  const listMethods = useForm<ListSchema>({
    defaultValues: { name, id, boardId },
    resolver: zodResolver(editListSchema),
  })

  const onSubmit: SubmitHandler<ListSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id, boardId })
  }

  const reorder = trpc.task.reorder.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: old?.lists.map((l) =>
              l.id === id
                ? {
                    ...l,
                    tasks: l.tasks.map((t) =>
                      t.id === input.draggableId
                        ? { ...t, order: input.itemTwoIndex }
                        : input.itemOneIndex > input.itemTwoIndex &&
                          t.order >= input.itemTwoIndex &&
                          t.order <= input.itemOneIndex
                        ? { ...t, order: t.order + 1 }
                        : input.itemOneIndex < input.itemTwoIndex &&
                          t.order <= input.itemTwoIndex &&
                          t.order >= input.itemOneIndex
                        ? { ...t, order: t.order - 1 }
                        : t
                    ),
                  }
                : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
    },
  })

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    // if (!result.destination || source?.index === destination?.index) {
    //   return
    // }
    if (destination) {
      reorder.mutate({
        itemOneIndex: source.index,
        itemTwoIndex: destination!.index,
        draggableId,
      })
    }
    if (source.droppableId !== destination?.droppableId) {
    }

    console.log(source, destination, draggableId)
  }

  return (
    <section
      className={`mt-4 flex min-w-[18rem] flex-col gap-4 border-t-4 bg-zinc-800 p-4 ${colorVariants[color]} `}
    >
      <div className="flex items-center gap-2">
        <ColorDot editColor={editColor} color={color}>
          <AnimatePresence>
            {isEditingColor && (
              <ColorPicker
                close={closeEditColor}
                editColor={updateColor}
                id={id}
              />
            )}
          </AnimatePresence>
        </ColorDot>
        {!isEditingName ? (
          <>
            <h2 className="text-xl">{name}</h2>
            <button
              onClick={add}
              className={`group py-2 ${isEditingColor && "scale-0"} `}
            >
              <PlusIcon />
            </button>
            <div className="ml-auto pr-2">
              <MenuButton>
                <MenuItem handleClick={add}>add task</MenuItem>
                <MenuItem handleClick={editName}>edit list name</MenuItem>
                <MenuItem handleClick={editColor}>change color</MenuItem>
                <MenuItem handleClick={() => deleteList.mutate(id)}>
                  delete list
                </MenuItem>
              </MenuButton>
            </div>
            <div
              {...dragHandleProps}
              className={`cursor-grab`}
              onClick={(e) => e.stopPropagation()}
            >
              <GoGrabber size={24} />
            </div>
          </>
        ) : (
          <FormProvider {...listMethods}>
            <AddEditForm
              name="name"
              placeholder="list name"
              close={closeEditName}
              handleSubmit={listMethods.handleSubmit(onSubmit)}
            />
          </FormProvider>
        )}
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-4"
          >
            {tasks
              .sort((a, b) => a.order - b.order)
              .map((task) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id}
                  index={task.order}
                >
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <motion.div
                        animate={{
                          rotate: snapshot.isDragging ? -5 : 0,
                        }}
                      >
                        <Task
                          key={task.id}
                          dragHandleProps={provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                          {...task}
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
      <AnimatePresence>
        {isAdding && <AddTaskModal close={closeAdd} listId={id} />}
      </AnimatePresence>
    </section>
  )
}

type TaskSchema = z.infer<typeof editTaskSchema>

interface TaskProps extends TaskWithAssignedTo {
  dragHandleProps: DraggableProvidedDragHandleProps | null
  isDragging: boolean
}

function Task({
  name,
  id,
  listId,
  assigned_to,
  color,
  dragHandleProps,
  isDragging,
}: TaskProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingUsers, editUsers, closeEditUsers] = useAddOrEdit()
  const { chosenBoardId } = useContext(LayoutContext)

  const assignedToIds = assigned_to.map((u) => u.id)

  const { assignedUsers, assignUser, assignUsers } =
    useAssignUser(assignedToIds)

  const utils = trpc.useContext()

  const taskMethods = useForm<TaskSchema>({
    defaultValues: { name, id, listId },
    resolver: zodResolver(editTaskSchema),
  })

  const updateName = trpc.task.editName.useMutation({
    async onMutate(updatedTask) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: old?.lists.map((l) =>
              l.id === listId
                ? {
                    ...l,
                    tasks: l.tasks.map((t) =>
                      t.id === updatedTask.id
                        ? { ...t, name: updatedTask.name }
                        : t
                    ),
                  }
                : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, updatedTask, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      utils.board.getById.invalidate(chosenBoardId!)
      closeEditName()
    },
  })

  const updateUsers = trpc.task.editUsers.useMutation({
    async onMutate(updatedTask) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()

      return { prevData }
    },
    onError(err, updatedTask, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      utils.board.getById.invalidate(chosenBoardId!)
      closeEditUsers()
    },
  })

  const deleteTask = trpc.task.delete.useMutation({
    async onMutate(deletedTaskId) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: old?.lists.map((l) =>
              l.id === listId
                ? {
                    ...l,
                    tasks: l.tasks.filter((t) => t.id !== deletedTaskId),
                  }
                : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, deletedTaskId, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      utils.board.getById.invalidate(chosenBoardId!)
    },
  })

  const onSubmit: SubmitHandler<TaskSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id, listId })
  }

  const users = trpc.board.getUsers.useQuery(chosenBoardId!)

  const taskAnimation = {
    initial: { height: 0, opacity: 0, padding: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0, padding: 0 },
  }

  const onSubmitUsers: SubmitHandler<TaskSchema> = (data: any) => {
    updateUsers.mutate({
      assigned_to: assignedUsers,
      id,
      listId,
      name,
    })
  }

  const [isEditingColor, editColor, closeEditColor] = useAddOrEdit()

  const updateColor = trpc.task.editColor.useMutation({
    async onMutate(updatedTask) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: old?.lists.map((l) =>
              l.id === listId
                ? {
                    ...l,
                    tasks: l.tasks.map((t) =>
                      t.id === updatedTask.id
                        ? { ...t, color: updatedTask.color }
                        : t
                    ),
                  }
                : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, updatedTask, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled: () => {
      utils.board.getById.invalidate(chosenBoardId)
      closeEditColor()
    },
  })

  return (
    <>
      <div
        className={`group flex items-center justify-between border-l-8 ${colorVariants[color]} bg-zinc-700 p-2`}
      >
        {!isEditingName ? (
          <>
            <div className="relative flex flex-col">
              <AnimatePresence>
                {isEditingColor && (
                  <ColorPicker
                    id={id}
                    close={closeEditColor}
                    editColor={updateColor}
                  />
                )}
              </AnimatePresence>
              <p className="font-bold">{name}</p>
              <ul className="flex flex-wrap gap-1">
                {assigned_to.map((user) => (
                  <li key={user.id} className="text-sm text-neutral-500">
                    {user.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="z-20 ml-auto scale-0 transition-transform group-hover:scale-100">
              <MenuButton>
                <MenuItem handleClick={editName}>edit task name</MenuItem>
                <MenuItem handleClick={editUsers}>assign user</MenuItem>
                <MenuItem handleClick={editColor}>change color</MenuItem>
                <MenuItem handleClick={() => deleteTask.mutate(id)}>
                  delete task
                </MenuItem>
              </MenuButton>
            </div>
            <div
              {...dragHandleProps}
              className={`cursor-grab group-hover:visible ${
                isDragging ? "visible" : "invisible"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <GoGrabber size={24} />
            </div>
          </>
        ) : (
          <div className="[&>form>input]:py-1.5 [&>form>input]:text-base">
            <FormProvider {...taskMethods}>
              <AddEditForm
                name="name"
                placeholder="task name"
                close={closeEditName}
                handleSubmit={taskMethods.handleSubmit(onSubmit)}
              />
            </FormProvider>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isEditingUsers && (
          <motion.form
            onSubmit={taskMethods.handleSubmit(onSubmitUsers)}
            {...taskAnimation}
          >
            <div className="flex flex-wrap gap-2">
              {users.data?.map((user) => (
                <UserCheckbox
                  key={user.id}
                  name={user.name!}
                  id={user.id}
                  assignUser={assignUser}
                  isAssigned={assignedToIds.includes(user.id)}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  updateUsers.mutate({
                    id,
                    name,
                    listId,
                    assigned_to: assignedUsers,
                  })
                }
                disabled={updateUsers.isLoading}
                className="ml-auto transition-transform hover:scale-110"
              >
                <AiOutlineCheck size={20} />
              </button>
              <button
                type="button"
                onClick={closeEditUsers}
                className="transition-transform hover:scale-110"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  )
}

export default List
