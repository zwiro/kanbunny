import {
  useEffect,
  useContext,
  useState,
  useRef,
  type ChangeEvent,
} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { trpc } from "@/utils/trpc"
import { z } from "zod"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { listSchema } from "@/utils/schemas"
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import { createNewList, reorderLists } from "@/mutations/listMutations"
import { reorderTasks } from "@/mutations/taskMutations"
import { getSession, type GetSessionParams, useSession } from "next-auth/react"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { prisma } from "@/server/db"
import { appRouter } from "@/server/routers/_app"
import ListSkeleton from "@/components/ListSkeleton"
import superjson from "superjson"
import ColorDot from "@/components/ColorDot"
import Filters from "@/components/Filters"
import MenuItem from "@/components/MenuItem"
import MenuWrapper from "@/components/MenuWrapper"
import AddButton from "@/components/AddButton"
import AddEditForm from "@/components/AddEditForm"
import ListContainer from "@/components/ListContainer"
import useBooleanState from "@/hooks/useBooleanState"
import PlusIcon from "@/components/PlusIcon"
import List from "@/components/List"
import SideMenu from "@/components/SideMenu"
import LayoutContext from "@/context/LayoutContext"
import getFilteredLists from "@/utils/getFilteredLists"

export default function Home() {
  const dragAreaRef = useRef<HTMLDivElement>(null)

  const { data: session } = useSession()

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string | Date | null>(null)
  const [assignedFilter, setAssignedFilter] = useState<string | null>(null)

  const [hideEmptyLists, , disableHideEmptyLists, toggleHideEmptyLists] =
    useBooleanState()

  const { isSideMenuOpen, closeSideMenu, chosenBoard } =
    useContext(LayoutContext)

  const [isAdding, add, closeAdd] = useBooleanState()

  const utils = trpc.useContext()

  const handleDateFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value)
  }

  const handleAssignedFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAssignedFilter(e.target.value)
  }

  const clearFilters = () => {
    setDateFilter(null)
    setAssignedFilter(null)
    disableHideEmptyLists()
  }

  const taskMutationCounter = useRef(0)
  const listMutationCounter = useRef(0)

  const lists = trpc.list.getByBoard.useQuery(chosenBoard?.id!, {
    enabled: !!chosenBoard?.id,
  })

  const userProjects = trpc.project.getByUser.useQuery()

  const board = trpc.board.getById.useQuery(chosenBoard?.id!, {
    enabled: !!chosenBoard?.id,
  })

  const search = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const resetQuery = () => {
    setSearchQuery("")
  }

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
  const reorder = reorderLists(chosenBoard?.id!, utils, listMutationCounter)

  const reorderDisplayedTasks = reorderTasks(
    chosenBoard?.id!,
    utils,
    taskMutationCounter
  )

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    const itemOne = lists.data
      ?.filter((l) => l.id === source.droppableId)[0]
      ?.tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery === ""
      )[source.index]
    const itemTwo = lists.data
      ?.filter((l) => l.id === destination?.droppableId)[0]
      ?.tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery === ""
      )[destination!.index]

    if (!destination) return
    if (source.droppableId === "board" || destination.droppableId === "board") {
      reorder.mutate({
        itemOneIndex: source.index,
        itemTwoIndex: destination.index,
        draggableId,
      })
    } else {
      if (!itemOne) return
      reorderDisplayedTasks.mutate({
        itemOneId: itemOne.id,
        itemTwoId: itemTwo?.id || undefined,
        itemOneOrder: itemOne.order,
        itemTwoOrder: destination.index,
        listId: destination.droppableId,
        prevListId: source.droppableId,
      })
    }
  }

  const bgBlurAnimation = {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(10px)" },
    exit: { backdropFilter: "blur(0px)" },
  }

  useEffect(() => {
    listMethods.reset({ boardId: chosenBoard?.id })
  }, [chosenBoard?.id, listMethods, board.data])

  return (
    <div
      ref={dragAreaRef}
      onClick={() => {
        closeSideMenu()
      }}
      className="flex h-full flex-col overflow-y-scroll"
    >
      {chosenBoard ? (
        <>
          <div className="sticky left-0 z-40 flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 [&>button]:cursor-default">
                  <ColorDot color={chosenBoard.color} />
                  <h2 className="text-2xl font-bold">{chosenBoard.name}</h2>
                </div>
                <MenuWrapper>
                  <MenuItem handleClick={add}>add list</MenuItem>
                </MenuWrapper>
              </div>
              <p className="text-slate-300">owner: {chosenBoard.owner}</p>
            </div>
            <Filters
              searchQuery={searchQuery}
              search={search}
              resetQuery={resetQuery}
              assignedFilter={assignedFilter}
              dateFilter={dateFilter}
              handleDateFilterChange={handleDateFilterChange}
              handleAssignedFilterChange={handleAssignedFilterChange}
              clearFilters={clearFilters}
              setDateFilter={setDateFilter}
              hideEmptyLists={hideEmptyLists}
              toggleHideEmptyLists={toggleHideEmptyLists}
            />
          </div>
          <div className="flex pb-4">
            {lists.isLoading && (
              <div className="flex gap-4 lg:gap-8 xl:gap-16">
                <ListSkeleton width={60} />
                <ListSkeleton width={130} />
                <ListSkeleton width={100} />
              </div>
            )}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="board"
                direction="horizontal"
                type="boards"
              >
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex min-h-[16rem] gap-4 lg:gap-8 xl:gap-16"
                  >
                    {!!lists.data?.length &&
                      getFilteredLists(
                        lists.data,
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
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <motion.div
                                  animate={{
                                    rotate: snapshot.isDragging ? -5 : 0,
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

            {isAdding ? (
              <ListContainer length={lists.data?.length || 0}>
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
                  lists.data?.length || lists.isLoading
                    ? "ml-4 lg:ml-8 xl:ml-16"
                    : "ml-0"
                } `}
              >
                <AddButton onClick={add}>
                  new list <PlusIcon />
                </AddButton>
              </div>
            )}
          </div>
        </>
      ) : (
        <h2 className="text-center font-bold text-neutral-300">
          open or create a new board
        </h2>
      )}

      <AnimatePresence>
        {isSideMenuOpen && (
          <>
            <motion.div {...bgBlurAnimation} className="fixed inset-0 z-40" />
            <SideMenu
              data={userProjects.data}
              isLoading={userProjects.isLoading}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export async function getServerSideProps(params: GetSessionParams) {
  const session = await getSession(params)
  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
      },
    }
  }
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, session },
    transformer: superjson,
  })

  await helpers.project.getByUser.prefetch()

  return {
    props: { trpcState: helpers.dehydrate() },
  }
}
