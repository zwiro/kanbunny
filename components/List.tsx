import { useContext, useState } from "react"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import AddEditForm from "./AddEditForm"
import ListContainer from "./ListContainer"
import AddTaskModal from "./AddTaskModal"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import { AnimatePresence, motion } from "framer-motion"
import useClickOutside from "@/hooks/useClickOutside"
import { useRef } from "react"
import ColorPicker from "./ColorPicker"
import UserCheckbox from "./UserCheckbox"
import type {
  List as ListType,
  Prisma,
  Task as TaskType,
  User,
} from "@prisma/client"
import ColorDot from "./ColorDot"
import { trpc } from "@/utils/trpc"
import LayoutContext from "@/context/LayoutContext"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import useAssignUser from "@/hooks/useAssignUser"
import { editListSchema, editTaskSchema } from "@/types/schemas"

type TaskWithAssignedTo = Prisma.TaskGetPayload<{
  include: { assigned_to: true }
}>

interface ListProps extends ListType {
  tasks: TaskWithAssignedTo[]
}

type ListSchema = z.infer<typeof editListSchema>

function List({ name, color, tasks, id, boardId }: ListProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingColor, editColor, closeEditColor] = useAddOrEdit()
  const [isAdding, add, closeAdd] = useAddOrEdit()
  const { chosenBoardId } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const listMethods = useForm<ListSchema>({
    defaultValues: { name, id, boardId },
    resolver: zodResolver(editListSchema),
  })

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

  const onSubmit: SubmitHandler<ListSchema> = (data: any) => {
    updateName.mutate({ name: data.name, id, boardId })
  }

  return (
    <section className="mt-4 flex h-min min-w-[18rem] flex-col gap-4 border border-neutral-800 bg-zinc-800 p-4">
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
      {tasks.map((task) => (
        <Task key={task.id} {...task} />
      ))}
      <AnimatePresence>
        {isAdding && <AddTaskModal close={closeAdd} listId={id} />}
      </AnimatePresence>
    </section>
  )
}

type TaskSchema = z.infer<typeof editTaskSchema>

function Task({ name, id, listId, assigned_to }: TaskWithAssignedTo) {
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
    // async onMutate(updatedTask) {
    //   await utils.board.getById.cancel()
    //   const prevData = utils.board.getById.getData()
    //   utils.board.getById.setData(
    //     chosenBoardId!,
    //     (old) =>
    //       ({
    //         ...old,
    //         lists: old?.lists.map((l) =>
    //           l.id === listId
    //             ? {
    //                 ...l,
    //                 tasks: l.tasks.map((t) =>
    //                   t.id === updatedTask.id
    //                     ? { ...t, assigned_to: updatedTask.assigned_to }
    //                     : t
    //                 ),
    //               }
    //             : l
    //         ),
    //       } as any)
    //   )
    //   return { prevData }
    // },
    // onError(err, updatedTask, ctx) {
    //   utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    // },
    onSuccess() {
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

  return (
    <>
      <div className="group flex items-center justify-between border-l-8 border-neutral-900 bg-zinc-700 p-2">
        {!isEditingName ? (
          <>
            <div className="flex flex-col">
              <p className="font-bold">{name}</p>
              <ul className="flex flex-wrap gap-1">
                {assigned_to.map((user) => (
                  <li key={user.id} className="text-sm text-neutral-500">
                    {user.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="scale-0 transition-transform group-hover:scale-100">
              <MenuButton>
                <MenuItem handleClick={editName}>edit task name</MenuItem>
                <MenuItem handleClick={editUsers}>assign user</MenuItem>
                <MenuItem handleClick={() => deleteTask.mutate(id)}>
                  delete task
                </MenuItem>
              </MenuButton>
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
