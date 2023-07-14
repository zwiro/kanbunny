import { useSession } from "next-auth/react"
import { useContext, useEffect } from "react"
import LayoutContext from "@/context/LayoutContext"
import { trpc } from "@/utils/trpc"
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import { motion } from "framer-motion"
import { z } from "zod"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import getFilteredLists from "@/utils/getFilteredLists"
import { type ListWithTasks } from "@/types/trpc"
import { createNewList, reorderLists } from "@/mutations/listMutations"
import { reorderTasks } from "@/mutations/taskMutations"
import List from "./List"
import { listSchema } from "@/utils/schemas"
import ListSkeleton from "./ListSkeleton"
import AddButton from "./AddButton"
import PlusIcon from "./PlusIcon"
import ListContainer from "./ListContainer"
import AddEditForm from "./AddEditForm"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"

interface ListsPanelProps {
  lists: ListWithTasks[] | undefined
  hideEmptyLists: boolean
  assignedFilter: string | null
  dateFilter: string | Date | null
  searchQuery: string
  taskMutationCounter: React.MutableRefObject<number>
  listMutationCounter: React.MutableRefObject<number>
  isLoading: boolean
  isAdding: boolean
  closeAdd: () => void
  add: () => void
}

function ListsPanel({
  lists,
  hideEmptyLists,
  assignedFilter,
  dateFilter,
  searchQuery,
  taskMutationCounter,
  listMutationCounter,
  isLoading,
  isAdding,
  closeAdd,
  add,
}: ListsPanelProps) {
  const { data: session } = useSession()

  const { chosenBoard } = useContext(LayoutContext)

  const board = trpc.board.getById.useQuery(chosenBoard?.id!, {
    enabled: !!chosenBoard?.id,
  })

  const utils = trpc.useContext()

  type ListSchema = z.infer<typeof listSchema>

  const listMethods = useForm<ListSchema>({
    defaultValues: { boardId: chosenBoard?.id },
    resolver: zodResolver(listSchema),
  })

  const createList = createNewList(
    chosenBoard?.id!,
    utils,
    closeAdd,
    listMethods
  )

  const onSubmit: SubmitHandler<ListSchema> = (data: any) => {
    createList.mutate({
      name: data.name,
      boardId: chosenBoard?.id!,
    })
  }

  useEffect(() => {
    listMethods.reset({ boardId: chosenBoard?.id })
  }, [chosenBoard?.id, listMethods, board.data])

  const reorder = reorderLists(chosenBoard?.id!, utils, listMutationCounter)

  const reorderDisplayedTasks = reorderTasks(
    chosenBoard?.id!,
    utils,
    taskMutationCounter
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over) return
    const itemOne = lists
      ?.filter((l) => l.id === active.id)[0]
      ?.tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery === ""
      )[active.data.current!.sortable.index]
    const itemTwo = lists
      ?.filter((l) => l.id === over.id)[0]
      ?.tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery === ""
      )[over.data.current!.sortable.index]

    if (active.data.current!.sortable.containerId === "lists") {
      reorder.mutate({
        itemOneIndex: active.data.current!.sortable.index,
        itemTwoIndex: over.data.current!.sortable.index,
        draggableId: active.id as string,
      })
      // } else {
      //   if (!itemOne) return
      //   reorderDisplayedTasks.mutate({
      //     itemOneId: itemOne.id,
      //     itemTwoId: itemTwo?.id || undefined,
      //     itemOneOrder: itemOne.order,
      //     itemTwoOrder: destination.index,
      //     listId: destination.droppableId,
      //     prevListId: source.droppableId,
      //   })
      // }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <div className="flex pb-12">
      {isLoading && (
        <div className="flex gap-4 lg:gap-8 xl:gap-16">
          <ListSkeleton width={60} />
          <ListSkeleton width={130} />
          <ListSkeleton width={100} />
        </div>
      )}
      <div className="flex min-h-[16rem] gap-4 lg:gap-8 xl:gap-16">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToHorizontalAxis]}
          key="lists"
        >
          <SortableContext
            items={getFilteredLists(
              lists!,
              hideEmptyLists,
              assignedFilter,
              dateFilter,
              session?.user.id
            )}
            strategy={horizontalListSortingStrategy}
            disabled={createList.isLoading}
            id="lists"
          >
            {getFilteredLists(
              lists!,
              hideEmptyLists,
              assignedFilter,
              dateFilter,
              session?.user.id
            )
              ?.sort((a, b) => a.order - b.order)
              .map((list) => (
                <List
                  key={list.id}
                  searchQuery={searchQuery}
                  dateFilter={dateFilter}
                  assignedFilter={assignedFilter}
                  hideEmptyLists={hideEmptyLists}
                  isUpdating={createList.isLoading}
                  taskMutationCounter={taskMutationCounter}
                  mutationCounter={listMutationCounter}
                  {...list}
                />
              ))}
          </SortableContext>
        </DndContext>
      </div>
      {isAdding ? (
        <ListContainer length={lists?.length || 0}>
          <div className="flex flex-col">
            <FormProvider {...listMethods}>
              <AddEditForm
                name="name"
                placeholder="list name"
                close={closeAdd}
                handleSubmit={listMethods.handleSubmit(onSubmit)}
              />
            </FormProvider>
            {listMethods.formState.errors && (
              <p role="alert" className="text-base text-red-500">
                {listMethods.formState.errors?.name?.message as string}
              </p>
            )}
          </div>
        </ListContainer>
      ) : (
        <div
          className={`${
            lists?.length || isLoading ? "ml-4 lg:ml-8 xl:ml-16" : "ml-0"
          } `}
        >
          <AddButton onClick={add}>
            new list <PlusIcon />
          </AddButton>
        </div>
      )}
    </div>
  )
}

export default ListsPanel
