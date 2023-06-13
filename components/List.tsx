import { FormEventHandler, useContext } from "react"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import {
  AiOutlineCheck,
  AiOutlineClockCircle,
  AiOutlineClose,
} from "react-icons/ai"
import AddEditForm from "./AddEditForm"
import AddTaskModal from "./AddTaskModal"
import useBooleanState from "@/hooks/useBooleanState"
import { AnimatePresence, motion } from "framer-motion"
import ColorPicker from "./ColorPicker"
import UserCheckbox from "./UserCheckbox"
import type { List as ListType, Prisma, Task, User } from "@prisma/client"
import ColorDot from "./ColorDot"
import { trpc } from "@/utils/trpc"
import LayoutContext from "@/context/LayoutContext"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import useAssignUser from "@/hooks/useAssignUser"
import { editListSchema, editTaskSchema } from "@/utils/schemas"
import { GoGrabber } from "react-icons/go"
import {
  Draggable,
  DraggableProvidedDragHandleProps,
  Droppable,
} from "@hello-pangea/dnd"
import {
  deleteOneTask,
  updateTaskColor,
  updateTaskUsers,
  updatedTaskName,
} from "@/mutations/taskMutations"
import {
  deleteOneList,
  updateListColor,
  updateListName,
} from "@/mutations/listMutations"
import { useSession } from "next-auth/react"
import getFilteredTasks from "@/utils/getFilteredTasks"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"

type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>

interface ListProps extends ListType {
  tasks: TaskWithAssignedTo[]
  dragHandleProps: DraggableProvidedDragHandleProps | null
  searchQuery: string
  dateFilter: string | Date | null
  assignedFilter: string | null
  isLoading: boolean
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
  dragHandleProps,
  searchQuery,
  dateFilter,
  assignedFilter,
  isLoading,
}: ListProps) {
  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingColor, editColor, closeEditColor] = useBooleanState()
  const [isAdding, add, closeAdd] = useBooleanState()

  const { chosenBoard } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const updateName = updateListName(chosenBoard?.id!, utils, closeEditName)
  const updateColor = updateListColor(chosenBoard?.id!, utils, closeEditColor)
  const deleteList = deleteOneList(chosenBoard?.id!, utils)

  type ListSchema = z.infer<typeof editListSchema>

  const listMethods = useForm<ListSchema>({
    defaultValues: { name, id, boardId },
    resolver: zodResolver(editListSchema),
  })

  const onSubmit: SubmitHandler<ListSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id, boardId })
  }

  const { data: session } = useSession()
  const userId = session?.user?.id

  return (
    <section
      className={`mt-4 flex min-w-[18rem] flex-col gap-4 border-t-4 bg-zinc-800 p-4 ${
        colorVariants[color]
      } ${isLoading && !id && "opacity-50"}`}
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
              disabled={isLoading || isEditingColor}
            >
              <PlusIcon />
            </button>
            <div className="ml-auto pr-2">
              <MenuWrapper isLoading={isLoading}>
                <MenuItem handleClick={add}>add task</MenuItem>
                <MenuItem handleClick={editName}>edit list name</MenuItem>
                <MenuItem handleClick={editColor}>change color</MenuItem>
                <MenuItem handleClick={() => deleteList.mutate(id)}>
                  delete list
                </MenuItem>
              </MenuWrapper>
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
      <Droppable
        droppableId={id || `placeholder-${Math.random()}`}
        key="task"
        direction="vertical"
        ignoreContainerClipping={true}
      >
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-4"
          >
            {getFilteredTasks(tasks, assignedFilter, dateFilter, userId)
              .sort((a, b) => a.order - b.order)
              .filter(
                (task) =>
                  task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  searchQuery === ""
              )
              .map((task, i) => (
                <Draggable key={task.id} draggableId={task.id} index={i}>
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
                          length={tasks.length}
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
  length: number
}

function Task({
  name,
  id,
  listId,
  assigned_to,
  color,
  dragHandleProps,
  isDragging,
  due_to,
}: TaskProps) {
  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingUsers, editUsers, closeEditUsers] = useBooleanState()
  const { chosenBoard } = useContext(LayoutContext)

  const assignedToIds = assigned_to.map((u) => u.id)

  const { assignedUsers, assignUser } = useAssignUser(assignedToIds)

  const utils = trpc.useContext()
  const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  })

  const timeDiff = due_to ? due_to.getTime() - new Date().getTime() : 0

  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  const taskMethods = useForm<TaskSchema>({
    defaultValues: { name, id, listId },
    resolver: zodResolver(editTaskSchema),
  })

  const updateName = updatedTaskName(
    chosenBoard?.id!,
    listId,
    utils,
    closeEditName
  )
  const updateUsers = updateTaskUsers(chosenBoard?.id!, utils, closeEditUsers)
  const deleteTask = deleteOneTask(chosenBoard?.id!, listId, utils)

  const onSubmit: SubmitHandler<TaskSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id, listId })
  }

  const users = trpc.board.getUsers.useQuery(chosenBoard?.id!)

  const onSubmitUsers: SubmitHandler<TaskSchema> = (data: any) => {
    updateUsers.mutate({
      assigned_to: assignedUsers,
      id,
      listId,
      name,
    })
  }

  const [isEditingColor, editColor, closeEditColor] = useBooleanState()

  const updateColor = updateTaskColor(
    chosenBoard?.id!,
    listId,
    utils,
    closeEditColor
  )

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
              <div className="flex items-center gap-2">
                <p
                  className={`font-bold ${minutesLeft < 0 && "text-zinc-400"} `}
                >
                  {name}
                </p>
                {daysLeft <= 0 && minutesLeft > 0 && <AiOutlineClockCircle />}
              </div>
              <p className="text-sm text-zinc-300">
                {due_to &&
                  timeDiff > 0 &&
                  (daysLeft > 0
                    ? relativeTimeFormat.format(daysLeft, "day")
                    : hoursLeft > 0
                    ? relativeTimeFormat.format(hoursLeft, "hour")
                    : relativeTimeFormat.format(minutesLeft, "minute"))}
              </p>
              <ul className="flex flex-wrap gap-1">
                {assigned_to.map((user) => (
                  <li key={user.id} className="text-sm text-neutral-500">
                    {user.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="z-20 ml-auto scale-0 transition-transform group-hover:scale-100">
              <MenuWrapper>
                <MenuItem handleClick={editName}>edit task name</MenuItem>
                <MenuItem handleClick={editUsers}>assign user</MenuItem>
                <MenuItem handleClick={editColor}>change color</MenuItem>
                <MenuItem handleClick={() => deleteTask.mutate(id)}>
                  delete task
                </MenuItem>
              </MenuWrapper>
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
          <EditTaskUsers
            assignUser={assignUser}
            assignedUsers={assignedUsers}
            closeEditUsers={closeEditUsers}
            assignedToIds={assignedToIds}
            listId={listId}
            name={name}
            onSubmit={taskMethods.handleSubmit(onSubmitUsers)}
            taskId={id}
            updateUsers={updateUsers}
            users={users}
          />
        )}
      </AnimatePresence>
    </>
  )
}

interface EditTaskUsersProps {
  onSubmit: FormEventHandler<HTMLFormElement>
  users: UseTRPCQueryResult<User[], any>
  assignUser: (userId: string) => void
  assignedToIds: string[]
  updateUsers: any
  assignedUsers: string[]
  closeEditUsers: () => void
  taskId: string
  listId: string
  name: string
}

function EditTaskUsers({
  onSubmit,
  users,
  assignUser,
  assignedToIds,
  updateUsers,
  assignedUsers,
  closeEditUsers,
  taskId,
  listId,
  name,
}: EditTaskUsersProps) {
  const taskAnimation = {
    initial: { height: 0, opacity: 0, padding: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0, padding: 0 },
  }

  return (
    <motion.form onSubmit={onSubmit} {...taskAnimation}>
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
              taskId,
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
  )
}

export default List
