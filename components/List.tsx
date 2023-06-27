import { type FormEventHandler, useContext } from "react"
import { useSession } from "next-auth/react"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import type { UseTRPCQueryResult } from "@trpc/react-query/shared"
import { trpc } from "@/utils/trpc"
import {
  AiOutlineCheck,
  AiOutlineClockCircle,
  AiOutlineClose,
} from "react-icons/ai"
import { GoGrabber } from "react-icons/go"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type {
  List as ListType,
  Prisma,
  Task as TaskType,
  User,
} from "@prisma/client"
import { editListSchema, editTaskSchema } from "@/utils/schemas"
import {
  Draggable,
  type DraggableProvidedDragHandleProps,
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
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import AddEditForm from "./AddEditForm"
import AddTaskModal from "./AddTaskModal"
import useBooleanState from "@/hooks/useBooleanState"
import ColorPicker from "./ColorPicker"
import UserCheckbox from "./UserCheckbox"
import ColorDot from "./ColorDot"
import LayoutContext from "@/context/LayoutContext"
import useAssignUser from "@/hooks/useAssignUser"
import getFilteredTasks from "@/utils/getFilteredTasks"
import ConfirmPopup from "./ConfirmPopup"
import { TaskWithAssignedTo } from "@/types/trpc"
import Task from "./Task"
import { colorVariants } from "@/utils/colorVariants"

interface ListProps extends ListType {
  tasks: TaskWithAssignedTo[]
  dragHandleProps: DraggableProvidedDragHandleProps | null
  searchQuery: string
  dateFilter: string | Date | null
  assignedFilter: string | null
  isUpdating: boolean
  taskMutationCounter: React.MutableRefObject<number>
  mutationCounter: React.MutableRefObject<number>
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
  isUpdating,
  mutationCounter,
  taskMutationCounter,
}: ListProps) {
  const [isEditingName, editName, closeEditName] = useBooleanState()
  const [isEditingColor, editColor, closeEditColor] = useBooleanState()
  const [isAdding, add, closeAdd] = useBooleanState()
  const [isPopupOpened, openPopup, closePopup] = useBooleanState()

  const { chosenBoard } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const updateName = updateListName(
    chosenBoard?.id!,
    utils,
    closeEditName,
    mutationCounter
  )
  const updateColor = updateListColor(
    chosenBoard?.id!,
    utils,
    closeEditColor,
    mutationCounter
  )
  const deleteList = deleteOneList(chosenBoard?.id!, utils, mutationCounter)

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

  const isLoading = isUpdating || updateName.isLoading || updateColor.isLoading
  return (
    <section
      className={`mt-4 flex min-w-[18rem] flex-col gap-4 border-b border-l border-r border-t-4 border-b-neutral-700 border-l-neutral-700 border-r-neutral-700 bg-zinc-800 p-4 ${
        colorVariants[color]
      } ${isUpdating && !id && "opacity-50"}       ${
        ((isUpdating && !id) ||
          updateName.isLoading ||
          updateColor.isLoading) &&
        "opacity-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <ColorDot
          editColor={!isEditingName ? editColor : undefined}
          color={color}
        >
          <AnimatePresence>
            {isEditingColor && (
              <ColorPicker
                close={closeEditColor}
                editColor={updateColor}
                id={id}
                currentColor={color}
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
              disabled={
                isUpdating ||
                isEditingColor ||
                updateColor.isLoading ||
                updateName.isLoading
              }
            >
              <PlusIcon />
            </button>
            <div className="ml-auto pr-2">
              <MenuWrapper isLoading={isLoading}>
                <MenuItem handleClick={add}>add task</MenuItem>
                <MenuItem handleClick={editName}>edit list name</MenuItem>
                <MenuItem handleClick={editColor}>change color</MenuItem>
                <MenuItem handleClick={openPopup}>delete list</MenuItem>
              </MenuWrapper>
            </div>
            <AnimatePresence>
              {isPopupOpened && (
                <ConfirmPopup
                  name={name}
                  type="list"
                  handleClick={() => deleteList.mutate(id)}
                  close={() => closePopup()}
                />
              )}
            </AnimatePresence>
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
              className="[&>input]:h-9"
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
                          mutationCounter={taskMutationCounter}
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

export default List
