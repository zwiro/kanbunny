import { useSession } from "next-auth/react"
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import { motion } from "framer-motion"
import getFilteredLists from "@/utils/getFilteredLists"
import { type List as ListType } from "@prisma/client"
import { type UseTRPCMutationResult } from "@trpc/react-query/shared"
import { type ListWithTasks } from "@/types/trpc"
import List from "./List"

interface DashboardProps {
  onDragEnd: (result: DropResult) => void
  lists: ListWithTasks[] | undefined
  hideEmptyLists: boolean
  assignedFilter: string | null
  dateFilter: string | Date | null
  createList: UseTRPCMutationResult<ListType, any, any, any>
  searchQuery: string
  taskMutationCounter: React.MutableRefObject<number>
  listMutationCounter: React.MutableRefObject<number>
}

function Dashboard({
  onDragEnd,
  lists,
  hideEmptyLists,
  assignedFilter,
  dateFilter,
  createList,
  searchQuery,
  taskMutationCounter,
  listMutationCounter,
}: DashboardProps) {
  const { data: session } = useSession()

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="boards">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex min-h-[16rem] gap-4 lg:gap-8 xl:gap-16"
          >
            {!!lists?.length &&
              getFilteredLists(
                lists,
                hideEmptyLists,
                assignedFilter,
                dateFilter,
                session?.user.id
              )
                ?.sort((a, b) => a.order - b.order)
                .map((list, i) => (
                  <Draggable
                    key={`list-${i}-${list.id}`}
                    draggableId={list.id || `placeholder-${i}`}
                    index={list.order}
                    isDragDisabled={createList.isLoading}
                  >
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <motion.div
                          animate={{
                            rotate: snapshot.isDragging ? "-5deg" : "0deg",
                          }}
                        >
                          <List
                            key={list.id}
                            dragHandleProps={provided.dragHandleProps}
                            searchQuery={searchQuery}
                            dateFilter={dateFilter}
                            assignedFilter={assignedFilter}
                            hideEmptyLists={hideEmptyLists}
                            isUpdating={createList.isLoading}
                            taskMutationCounter={taskMutationCounter}
                            mutationCounter={listMutationCounter}
                            {...list}
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
  )
}

export default Dashboard
