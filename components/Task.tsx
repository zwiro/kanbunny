import { type FormEventHandler, useContext, useState } from "react"
import {
  AiOutlineCheck,
  AiOutlineClockCircle,
  AiOutlineClose,
} from "react-icons/ai"
import type { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { User } from "@prisma/client"
import { motion, AnimatePresence } from "framer-motion"
import { GoGrabber } from "react-icons/go"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { isMobile } from "react-device-detect"
import type { TaskWithAssignedTo } from "@/types/trpc"
import DateTimePicker from "react-datetime-picker"
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"
import { trpc } from "@/utils/trpc"
import {
  deleteOneTask,
  updateTaskColor,
  updateTaskDate,
  updateTaskUsers,
  updatedTaskName,
} from "@/mutations/taskMutations"
import { editTaskSchema } from "@/utils/schemas"
import formatRelativeTime from "@/utils/formatRelativeTime"
import useAssignUser from "@/hooks/useAssignUser"
import useBooleanState from "@/hooks/useBooleanState"
import LayoutContext from "@/context/LayoutContext"
import UserCheckbox from "./UserCheckbox"
import AddEditForm from "./AddEditForm"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import ColorPicker from "./ColorPicker"
import { LoadingDots } from "./LoadingDots"

type TaskSchema = z.infer<typeof editTaskSchema>

interface TaskProps extends TaskWithAssignedTo {
  dragHandleProps: DraggableProvidedDragHandleProps | null
  isDragging: boolean
  length: number
  mutationCounter: React.MutableRefObject<number>
  isFiltered: boolean
}

function Task({
  name,
  id,
  listId,
  assigned_to,
  color,
  due_to,
  mutationCounter,
  isFiltered,
  dragHandleProps,
  isDragging,
}: TaskProps) {
  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingUsers, editUsers, closeEditUsers] = useBooleanState()
  const [isEditingColor, editColor, closeEditColor] = useBooleanState()
  const [isEditingDate, editDate, closeEditDate] = useBooleanState()

  const [date, onChange] = useState<Date | null>(due_to)

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
  const updateColor = updateTaskColor(
    chosenBoard?.id!,
    listId,
    utils,
    closeEditColor,
    mutationCounter
  )
  const updateDate = updateTaskDate(
    chosenBoard?.id!,
    listId,
    utils,
    closeEditDate,
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

  const onSubmitDate: SubmitHandler<TaskSchema> = (data: any) => {
    updateDate.mutate({ id, due_to: date! })
  }

  const colorVariants = {
    blue: "border-blue-500",
    red: "border-red-500",
    yellow: "border-yellow-500",
    green: "border-green-500",
    pink: "border-pink-500",
  }

  const isLoading = updateName.isLoading || updateColor.isLoading

  const taskAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <>
      <div
        {...taskAnimation}
        tabIndex={0}
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
              <div className="flex items-center gap-2 ">
                <h4
                  className={`max-w-[14rem] break-words text-sm font-bold sm:max-w-[18rem] sm:text-base ${
                    minutesLeft < 0 && "line-through"
                  }`}
                >
                  {name}
                </h4>
                {daysLeft <= 0 && minutesLeft > 0 && <AiOutlineClockCircle />}
              </div>
              <p className="text-sm text-zinc-300">
                {due_to && timeDiff > 0
                  ? daysLeft > 0
                    ? formatRelativeTime(
                        relativeTimeFormat.format(daysLeft, "day")
                      )
                    : hoursLeft > 0
                    ? formatRelativeTime(
                        relativeTimeFormat.format(hoursLeft, "hour")
                      )
                    : formatRelativeTime(
                        relativeTimeFormat.format(minutesLeft, "minute")
                      )
                  : due_to &&
                    (daysLeft < -1
                      ? relativeTimeFormat.format(daysLeft, "day")
                      : hoursLeft < -1
                      ? relativeTimeFormat.format(hoursLeft, "hour")
                      : relativeTimeFormat.format(minutesLeft, "minute"))}
              </p>
              {!!assigned_to.length && (
                <hr className="my-1 w-48 border-zinc-500" />
              )}
              <ul className="flex flex-wrap gap-1">
                {assigned_to.map((user) => (
                  <li key={user.id} className="text-sm text-neutral-300">
                    {user.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center self-start">
              <div
                className={`z-10 ml-auto ${
                  isMobile
                    ? "scale-100"
                    : "scale-0 transition-transform group-focus-within:scale-100 group-hover:scale-100"
                }`}
              >
                <MenuWrapper isLoading={isLoading}>
                  <MenuItem handleClick={editName}>edit task name</MenuItem>
                  <MenuItem handleClick={editUsers}>assign user</MenuItem>
                  <MenuItem handleClick={editDate}>change due date</MenuItem>
                  <MenuItem handleClick={editColor}>change color</MenuItem>
                  <MenuItem handleClick={() => deleteTask.mutate(id)}>
                    delete task
                  </MenuItem>
                </MenuWrapper>
              </div>
              <button
                {...dragHandleProps}
                aria-label="Grab to drag"
                tabIndex={0}
                className={`group-focus-within:visible group-hover:visible 
                ${isDragging ? "visible" : !isMobile && "invisible"} 
                ${isFiltered && "pointer-events-none"} `}
                onClick={(e) => e.stopPropagation()}
              >
                <GoGrabber size={24} />
              </button>
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
                defaultValue={name}
              />
            </FormProvider>
            {taskMethods.formState.errors && (
              <p role="alert" className="text-base text-red-500">
                {taskMethods.formState.errors?.name?.message as string}
              </p>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {isEditingUsers && (
          <EditTaskUsers
            assignUser={assignUser}
            closeEditUsers={closeEditUsers}
            assignedToIds={assignedToIds}
            onSubmit={taskMethods.handleSubmit(onSubmitUsers)}
            updateUsers={updateUsers}
            users={users}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditingDate && (
          <EditTaskDate
            closeEditDate={closeEditDate}
            onSubmit={taskMethods.handleSubmit(onSubmitDate)}
            date={date}
            onChange={onChange}
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
  closeEditUsers: () => void
}

function EditTaskUsers({
  onSubmit,
  users,
  assignUser,
  assignedToIds,
  updateUsers,
  closeEditUsers,
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
        {!updateUsers.isLoading ? (
          <>
            <button
              disabled={updateUsers.isLoading}
              className="ml-auto transition-transform hover:scale-110 focus:scale-110"
              aria-label="Submit date"
            >
              <AiOutlineCheck size={20} />
            </button>
            <button
              type="button"
              onClick={closeEditUsers}
              className="transition-transform hover:scale-110 focus:scale-110"
              aria-label="Cancel"
            >
              <AiOutlineClose size={20} />
            </button>
          </>
        ) : (
          <LoadingDots className="ml-auto" />
        )}
      </div>
    </motion.form>
  )
}

interface EditTaskDateProps {
  date: Date | null | undefined
  onChange: (date: Date | null) => void
  closeEditDate: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

function EditTaskDate({
  date,
  onChange,
  closeEditDate,
  onSubmit,
}: EditTaskDateProps) {
  const taskAnimation = {
    initial: { height: 0, opacity: 0, padding: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0, padding: 0 },
  }

  return (
    <motion.form onSubmit={onSubmit} {...taskAnimation}>
      <div className="pt-8">
        <DateTimePicker
          onChange={onChange}
          value={date}
          disableClock
          minDate={new Date()}
          calendarIcon={null}
          format="y-MM-dd h:mm a"
          className="w-fit"
          amPmAriaLabel="Select AM/PM"
          dayAriaLabel="Day"
          hourAriaLabel="Hour"
          minuteAriaLabel="Minute"
          monthAriaLabel="Month"
          yearAriaLabel="Year"
          nativeInputAriaLabel="Due to"
          clearAriaLabel="Clear value"
        />
      </div>
      <div className="flex items-center gap-1">
        <button
          className="ml-auto transition-transform hover:scale-110 focus:scale-110"
          aria-label="Submit users"
        >
          <AiOutlineCheck size={20} />
        </button>
        <button
          type="button"
          onClick={closeEditDate}
          className="transition-transform hover:scale-110 focus:scale-110"
          aria-label="Cancel"
        >
          <AiOutlineClose size={20} />
        </button>
      </div>
    </motion.form>
  )
}

export default Task
