import {
  AiOutlineCheck,
  AiOutlineClockCircle,
  AiOutlineClose,
} from "react-icons/ai"
import UserCheckbox from "./UserCheckbox"
import { FormEventHandler, useContext } from "react"
import { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { User } from "@prisma/client"
import { motion, AnimatePresence } from "framer-motion"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import AddEditForm from "./AddEditForm"
import { GoGrabber } from "react-icons/go"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import ColorPicker from "./ColorPicker"
import {
  deleteOneTask,
  updateTaskColor,
  updateTaskUsers,
  updatedTaskName,
} from "@/mutations/taskMutations"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/utils/trpc"
import useAssignUser from "@/hooks/useAssignUser"
import LayoutContext from "@/context/LayoutContext"
import useBooleanState from "@/hooks/useBooleanState"
import { editTaskSchema } from "@/utils/schemas"
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"
import { z } from "zod"
import { TaskWithAssignedTo } from "@/types/trpc"
import { colorVariants } from "@/utils/colorVariants"

type TaskSchema = z.infer<typeof editTaskSchema>

interface TaskProps extends TaskWithAssignedTo {
  dragHandleProps: DraggableProvidedDragHandleProps | null
  isDragging: boolean
  length: number
  mutationCounter: React.MutableRefObject<number>
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
  mutationCounter,
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
    closeEditName,
    mutationCounter
  )
  const updateUsers = updateTaskUsers(
    chosenBoard?.id!,
    utils,
    closeEditUsers,
    mutationCounter
  )
  const deleteTask = deleteOneTask(
    chosenBoard?.id!,
    listId,
    utils,
    mutationCounter
  )

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
    closeEditColor,
    mutationCounter
  )

  const isLoading = updateName.isLoading || updateColor.isLoading

  return (
    <>
      <div
        className={`group flex items-center justify-between border-b border-l-8 border-r border-t border-b-neutral-800 border-r-neutral-800 border-t-neutral-800 ${
          colorVariants[color]
        } bg-zinc-700 p-2
          ${isLoading && "opacity-50"}
          `}
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
                    currentColor={color}
                  />
                )}
              </AnimatePresence>
              <div className="flex items-center gap-2">
                <p
                  className={`font-bold ${minutesLeft < 0 && "text-zinc-400"}`}
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
              <MenuWrapper isLoading={isLoading}>
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
                className="[&>input]:h-9"
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
      <div className="flex flex-wrap gap-2 pt-8">
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

export default Task
