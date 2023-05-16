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
import { List as ListType, Task } from "@prisma/client"
import ColorDot from "./ColorDot"
import { trpc } from "@/utils/trpc"
import LayoutContext from "@/context/LayoutContext"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface ListProps extends ListType {
  tasks: Task[]
}

export const editListSchema = z.object({
  name: z.string().min(1, { message: "list name is required" }),
  boardId: z.string(),
  id: z.string(),
})

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

function Task({ name }: Task) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingUsers, editUsers, closeEditUsers] = useAddOrEdit()

  const taskAnimation = {
    initial: { height: 0, opacity: 0, padding: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0, padding: 0 },
  }

  return (
    <>
      <div className="group flex items-center justify-between border-l-8 border-neutral-900 bg-zinc-700 p-2">
        {!isEditingName ? (
          <>
            <p>{name}</p>
            <div className="scale-0 transition-transform group-hover:scale-100">
              <MenuButton>
                <MenuItem handleClick={editName}>edit task name</MenuItem>
                <MenuItem handleClick={editUsers}>assign user</MenuItem>
                <MenuItem>delete task</MenuItem>
              </MenuButton>
            </div>
          </>
        ) : (
          <div className="[&>form>input]:py-1.5 [&>form>input]:text-base">
            <AddEditForm
              name="task name"
              placeholder="task name"
              close={closeEditName}
            />
          </div>
        )}
      </div>
      <AnimatePresence>
        {isEditingUsers && (
          <motion.div {...taskAnimation}>
            <div className="flex flex-wrap gap-2">
              <UserCheckbox name="janek" />
              <UserCheckbox name="john" />
              <UserCheckbox name="bobby" />
              <UserCheckbox name="adam" />
              <UserCheckbox name="jimmy" />
              <UserCheckbox name="daniel" />
            </div>
            <div className="flex items-center gap-1">
              <button className="ml-auto transition-transform hover:scale-110">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default List
