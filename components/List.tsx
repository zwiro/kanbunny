import { useContext } from "react"
import { useSession } from "next-auth/react"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { AnimatePresence } from "framer-motion"
import { trpc } from "@/utils/trpc"
import { GoGrabber } from "react-icons/go"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { List as ListType } from "@prisma/client"
import { editListSchema } from "@/utils/schemas"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import {
  deleteOneList,
  updateListColor,
  updateListName,
} from "@/mutations/listMutations"
import type { TaskWithAssignedTo } from "@/types/trpc"
import getFilteredTasks from "@/utils/getFilteredTasks"
import useBooleanState from "@/hooks/useBooleanState"
import LayoutContext from "@/context/LayoutContext"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import AddEditForm from "./AddEditForm"
import ColorPicker from "./ColorPicker"
import ColorDot, { ColorDotButton } from "./ColorDot"
import ConfirmPopup from "./ConfirmPopup"
import Task from "./Task"
import AddTaskModal from "./AddTaskModal"

interface ListProps extends ListType {
  tasks: TaskWithAssignedTo[]
  searchQuery: string
  dateFilter: string | Date | null
  assignedFilter: string | null
  isUpdating: boolean
  taskMutationCounter: React.MutableRefObject<number>
  mutationCounter: React.MutableRefObject<number>
  hideEmptyLists: boolean
}

function List({
  name,
  color,
  tasks,
  id,
  boardId,
  searchQuery,
  dateFilter,
  assignedFilter,
  isUpdating,
  mutationCounter,
  taskMutationCounter,
  hideEmptyLists,
}: ListProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id

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

  const colorVariants = {
    blue: "border-blue-500",
    red: "border-red-500",
    yellow: "border-yellow-500",
    green: "border-green-500",
    pink: "border-pink-500",
  }

  const isLoading =
    isUpdating ||
    updateName.isLoading ||
    updateColor.isLoading ||
    deleteList.isLoading

  const isFiltered =
    Boolean(dateFilter) ||
    Boolean(assignedFilter) ||
    Boolean(searchQuery) ||
    hideEmptyLists

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isLoading,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const filteredTasks = getFilteredTasks(
    tasks,
    assignedFilter,
    dateFilter,
    userId
  )

  return (
    <>
      <section
        ref={setNodeRef}
        {...attributes}
        style={style}
        className={`mx-2 mt-4 flex min-w-[18rem] max-w-xs cursor-default flex-col gap-4 border-b border-l border-r border-t-4 border-b-neutral-700 border-l-neutral-700 border-r-neutral-700 bg-zinc-800 p-4 first-of-type:ml-0 sm:max-w-sm lg:mx-4 xl:mx-8 ${
          colorVariants[color]
        } ${isUpdating && !id && "opacity-50"}       ${
          ((isUpdating && !id) ||
            updateName.isLoading ||
            updateColor.isLoading) &&
          "opacity-50"
        }
        ${isDragging ? "z-10" : ""}
        `}
      >
        <div className="flex items-center gap-2">
          <ColorDot>
            <AnimatePresence>
              {isEditingColor ? (
                <ColorPicker
                  close={closeEditColor}
                  editColor={updateColor}
                  id={id}
                  currentColor={color}
                />
              ) : (
                <ColorDotButton
                  editColor={!isEditingName ? editColor : undefined}
                  color={color}
                />
              )}
            </AnimatePresence>
          </ColorDot>
          {!isEditingName ? (
            <>
              <h3 className="max-w-[60%] break-words text-base sm:text-xl">
                {name}
              </h3>
              <button
                onClick={add}
                className={`group py-2 ${isEditingColor && "scale-0"} `}
                disabled={isEditingColor || isLoading}
                aria-label="Add new task"
              >
                <PlusIcon />
              </button>
              <div className="ml-auto flex items-center self-start">
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
                <button
                  disabled={isLoading}
                  ref={setActivatorNodeRef}
                  {...listeners}
                  aria-label="Grab to drag"
                  tabIndex={0}
                  className={`${isFiltered && "pointer-events-none"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GoGrabber size={24} />
                </button>
              </div>
            </>
          ) : (
            <div>
              <FormProvider {...listMethods}>
                <AddEditForm
                  name="name"
                  placeholder="list name"
                  close={closeEditName}
                  handleSubmit={listMethods.handleSubmit(onSubmit)}
                  className="[&>input]:h-9"
                  defaultValue={name}
                />
              </FormProvider>
              {listMethods.formState.errors && (
                <p role="alert" className="text-base text-red-500">
                  {listMethods.formState.errors?.name?.message as string}
                </p>
              )}
            </div>
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
              <AnimatePresence>
                {filteredTasks
                  .filter(
                    (task) =>
                      task.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      searchQuery === ""
                  )
                  .map((task, i) => (
                    <Draggable key={task.id} draggableId={task.id} index={i}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="draggable"
                        >
                          <Task
                            key={task.id}
                            dragHandleProps={provided.dragHandleProps}
                            isDragging={snapshot.isDragging}
                            length={tasks.length}
                            mutationCounter={taskMutationCounter}
                            isFiltered={isFiltered}
                            {...task}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </section>
      <AnimatePresence>
        {isAdding && <AddTaskModal close={closeAdd} listId={id} />}
      </AnimatePresence>
    </>
  )
}

export default List
