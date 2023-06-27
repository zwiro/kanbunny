import {
  useEffect,
  useContext,
  useState,
  useRef,
  type ChangeEvent,
} from "react"
import PlusIcon from "@/components/PlusIcon"
import List from "@/components/List"
import SideMenu from "@/components/SideMenu"
import LayoutContext from "@/context/LayoutContext"
import { motion, AnimatePresence } from "framer-motion"
import MenuItem from "@/components/MenuItem"
import MenuWrapper from "@/components/MenuWrapper"
import AddButton from "@/components/AddButton"
import AddEditForm from "@/components/AddEditForm"
import ListContainer from "@/components/ListContainer"
import useBooleanState from "@/hooks/useBooleanState"
import { trpc } from "@/utils/trpc"
import { z } from "zod"
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ColorDot from "@/components/ColorDot"
import { listSchema } from "@/utils/schemas"
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import { createNewList, reorderLists } from "@/mutations/listMutations"
import { reorderTasks } from "@/mutations/taskMutations"
import useClickOutside from "@/hooks/useClickOutside"

import {
  AiFillFilter,
  AiOutlineClose,
  AiOutlineFilter,
  AiOutlineSearch,
} from "react-icons/ai"
import DateTimePicker from "react-datetime-picker"
import ListSkeleton from "@/components/ListSkeleton"
import { useSession, getSession, GetSessionParams } from "next-auth/react"
import { LoadingDots } from "@/components/LoadingDots"
import { useRouter } from "next/router"
import AddProjectModal from "@/components/AddProjectModal"
import ConfirmPopup from "@/components/ConfirmPopup"
import { createServerSideHelpers } from "@trpc/react-query/server"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { prisma } from "@/server/db"
import { appRouter } from "@/server/routers/_app"
import superjson from "superjson"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isSideMenuOpen, toggleSideMenu, closeSideMenu } =
    useContext(LayoutContext)

  const [isAdding, add, closeAdd] = useBooleanState()

  const { chosenBoard } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string | Date | null>(null)
  const [assignedFilter, setAssignedFilter] = useState<string | null>(null)

  const handleDateFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value)
  }

  const handleAssignedFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAssignedFilter(e.target.value)
  }

  const clearFilters = () => {
    setDateFilter(null)
    setAssignedFilter(null)
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

  useEffect(() => {
    listMethods.reset({ boardId: chosenBoard?.id })
  }, [chosenBoard?.id, listMethods, board.data])

  const onSubmit: SubmitHandler<ListSchema> = (data: any) => {
    createList.mutate({
      name: data.name,
      boardId: chosenBoard?.id!,
    })
  }

  const bgBlurAnimation = {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(10px)" },
    exit: { backdropFilter: "blur(0px)" },
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

  return (
    <>
      <div
        onClick={() => {
          closeSideMenu()
        }}
        className="flex flex-col"
      >
        {chosenBoard ? (
          <>
            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 [&>div]:cursor-default">
                  <ColorDot color={chosenBoard.color} />
                  <h1 className="text-2xl font-bold">{chosenBoard.name}</h1>
                </div>
                <MenuWrapper>
                  <MenuItem handleClick={add}>add list</MenuItem>
                </MenuWrapper>
                <Filters
                  searchQuery={searchQuery}
                  search={search}
                  assignedFilter={assignedFilter}
                  dateFilter={dateFilter}
                  handleDateFilterChange={handleDateFilterChange}
                  handleAssignedFilterChange={handleAssignedFilterChange}
                  clearFilters={clearFilters}
                  setDateFilter={setDateFilter}
                />
              </div>
              <p className="text-slate-300">owner: {chosenBoard.owner}</p>
            </div>
            <div className="flex gap-4 overflow-y-hidden overflow-x-scroll pb-48 lg:gap-8 xl:gap-16">
              {lists.isLoading && (
                <>
                  <ListSkeleton width={60} />
                  <ListSkeleton width={130} />
                  <ListSkeleton width={100} />
                </>
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
                        lists.data
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
                <ListContainer>
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
                <AddButton onClick={add}>
                  new list <PlusIcon />
                </AddButton>
              )}
            </div>
          </>
        ) : (
          <p className="text-center font-bold text-neutral-500">
            open or create a new board
          </p>
        )}

        <AnimatePresence>
          {isSideMenuOpen && (
            <>
              <motion.div {...bgBlurAnimation} className="fixed inset-0" />
              <SideMenu
                data={userProjects.data}
                isLoading={userProjects.isLoading}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

interface FiltersProps {
  searchQuery: string
  search: (e: ChangeEvent<HTMLInputElement>) => void
  assignedFilter: string | null
  dateFilter: Date | string | null
  handleAssignedFilterChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleDateFilterChange: (e: ChangeEvent<HTMLInputElement>) => void
  clearFilters: () => void
  setDateFilter: React.Dispatch<React.SetStateAction<Date | string | null>>
}

function Filters({
  searchQuery,
  search,
  assignedFilter,
  dateFilter,
  handleAssignedFilterChange,
  handleDateFilterChange,
  clearFilters,
  setDateFilter,
}: FiltersProps) {
  const [isSearchOpen, , , toggleSearch] = useBooleanState()
  const [isFilterOpen, , closeFilter, toggleFilter] = useBooleanState()

  const filterRef = useRef<HTMLDivElement>(null)
  useClickOutside([filterRef], closeFilter)

  return (
    <div className="relative ml-auto">
      <div className="flex items-center justify-end gap-1">
        <button onClick={toggleFilter}>
          {dateFilter || assignedFilter ? (
            <AiFillFilter size={32} />
          ) : (
            <AiOutlineFilter size={32} />
          )}
        </button>
        <div className="flex">
          <button onClick={toggleSearch}>
            {isSearchOpen ? (
              <AiOutlineClose size={32} />
            ) : (
              <AiOutlineSearch size={32} />
            )}
          </button>
          <AnimatePresence>
            {isSearchOpen && (
              <motion.input
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                exit={{ width: 0 }}
                value={searchQuery}
                onChange={search}
                type="search"
                placeholder="add dark mode..."
                className="bg-zinc-900 p-1"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
      <div ref={filterRef}>
        <AnimatePresence>
          {isFilterOpen && (
            <FiltersMenu
              assignedFilter={assignedFilter}
              clearFilters={clearFilters}
              dateFilter={dateFilter}
              handleAssignedFilterChange={handleAssignedFilterChange}
              handleDateFilterChange={handleDateFilterChange}
              setDateFilter={setDateFilter}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface FiltersMenuProps {
  handleAssignedFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDateFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  assignedFilter: string | null
  dateFilter: string | Date | null
  setDateFilter: React.Dispatch<React.SetStateAction<Date | string | null>>
  clearFilters: () => void
}

function FiltersMenu({
  handleAssignedFilterChange,
  handleDateFilterChange,
  assignedFilter,
  dateFilter,
  setDateFilter,
  clearFilters,
}: FiltersMenuProps) {
  const filterAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <motion.div
      {...filterAnimation}
      className="absolute right-0 z-30 origin-top-right whitespace-nowrap bg-zinc-900/95 p-4 shadow-md shadow-black"
    >
      <fieldset className="flex items-center gap-1">
        <legend>task state</legend>
        <FilterButton
          value="assigned_user"
          name="task_type"
          filter={assignedFilter}
          handleChange={handleAssignedFilterChange}
          inputClassName="peer/assigned_user"
          labelClassName="peer-checked/assigned_user:bg-zinc-700"
        >
          assigned to me
        </FilterButton>
        <FilterButton
          value="assigned"
          name="task_type"
          filter={assignedFilter}
          handleChange={handleAssignedFilterChange}
          inputClassName="peer/assigned"
          labelClassName="peer-checked/assigned:bg-zinc-700"
        >
          assigned
        </FilterButton>
        <FilterButton
          value="unassigned"
          name="task_type"
          filter={assignedFilter}
          handleChange={handleAssignedFilterChange}
          inputClassName="peer/unassigned"
          labelClassName="peer-checked/unassigned:bg-zinc-700"
        >
          unassigned
        </FilterButton>
      </fieldset>
      <fieldset className="flex flex-wrap items-center gap-1">
        <legend>due to</legend>
        <FilterButton
          value="tomorrow"
          name="due_to"
          filter={dateFilter}
          handleChange={handleDateFilterChange}
          inputClassName="peer/tomorrow"
          labelClassName="peer-checked/tomorrow:bg-zinc-700"
        >
          tomorrow
        </FilterButton>
        <FilterButton
          value="next_week"
          name="due_to"
          filter={dateFilter}
          handleChange={handleDateFilterChange}
          inputClassName="peer/next_week"
          labelClassName="peer-checked/next_week:bg-zinc-700"
        >
          next week
        </FilterButton>
        <FilterButton
          value="next_month"
          name="due_to"
          filter={dateFilter}
          handleChange={handleDateFilterChange}
          inputClassName="peer/next_month"
          labelClassName="peer-checked/next_month:bg-zinc-700"
        >
          next month
        </FilterButton>
        <DateTimePicker
          onChange={setDateFilter}
          value={Boolean(dateFilter instanceof Date) ? dateFilter : null}
          disableClock
          calendarIcon={null}
          format="y-MM-dd h:mm a"
          className="border border-zinc-700"
        />
      </fieldset>
      <button onClick={clearFilters} className="mt-2 bg-zinc-700 px-2 py-1">
        clear filters
      </button>
    </motion.div>
  )
}

interface FilterButtonProps {
  value: string
  name: string
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  filter: string | Date | null
  inputClassName: string
  labelClassName: string
  children: React.ReactNode | string
}

function FilterButton({
  value,
  name,
  handleChange,
  filter,
  inputClassName,
  labelClassName,
  children,
}: FilterButtonProps) {
  return (
    <>
      <input
        type="radio"
        id={value}
        value={value}
        name={name}
        onChange={handleChange}
        checked={filter === value}
        className={`hidden ${inputClassName}`}
      />
      <label
        htmlFor={value}
        className={`cursor-pointer border border-zinc-700 px-1 ${labelClassName}`}
      >
        {children}
      </label>
    </>
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
