import { useEffect, useContext, useState, useRef, ChangeEvent } from "react"
import { useRouter } from "next/router"
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
import { date, z } from "zod"
import { FormProvider, SubmitHandler, set, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ColorDot from "@/components/ColorDot"
import { listSchema } from "@/utils/schemas"
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import { Task } from "@prisma/client"
import { createNewList, reorderLists } from "@/mutations/listMutations"
import { reorderTasks } from "@/mutations/taskMutations"
import useClickOutside from "@/hooks/useClickOutside"
import MenuContext from "@/context/MenuContext"
import TextInput from "@/components/TextInput"
import ExpandChevron from "@/components/ExpandChevron"
import {
  AiFillFilter,
  AiOutlineClose,
  AiOutlineFilter,
  AiOutlineSearch,
} from "react-icons/ai"
import DateTimePicker from "react-datetime-picker"
import { useSession } from "next-auth/react"

export default function Home() {
  const { isSideMenuOpen, closeSideMenu, toggleSideMenu } =
    useContext(LayoutContext)

  const [isAdding, add, closeAdd] = useBooleanState()

  const { chosenBoardId } = useContext(LayoutContext)

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

  // move to context later

  const lists = trpc.list.getByBoard.useQuery(chosenBoardId!)

  const userProjects = trpc.project.getByUser.useQuery()

  const board = trpc.board.getById.useQuery(chosenBoardId!, {
    enabled: !!chosenBoardId,
  })

  const search = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  type ListSchema = z.infer<typeof listSchema>

  const listMethods = useForm<ListSchema>({
    defaultValues: { boardId: chosenBoardId },
    resolver: zodResolver(listSchema),
  })

  const createList = createNewList(chosenBoardId!, utils, closeAdd, listMethods)

  useEffect(() => {
    listMethods.reset({ boardId: chosenBoardId })
  }, [chosenBoardId, listMethods, board.data])

  const onSubmit: SubmitHandler<ListSchema> = (data: any) => {
    createList.mutate({
      name: data.name,
      boardId: chosenBoardId!,
    })
  }

  const bgBlurAnimation = {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(10px)" },
    exit: { backdropFilter: "blur(0px)" },
  }

  const reorder = reorderLists(chosenBoardId!, utils)

  const reorderDisplayedTasks = reorderTasks(chosenBoardId!, utils)

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
    <div
      onClick={() => {
        closeSideMenu()
      }}
      className="flex flex-col"
    >
      {chosenBoardId ? (
        <>
          <div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ColorDot color={board.data?.color!} />
                <h1 className="text-2xl font-bold">{board.data?.name}</h1>
              </div>
              <MenuWrapper direction="right">
                <MenuItem handleClick={add}>add list</MenuItem>
                <MenuItem handleClick={toggleSideMenu}>more options</MenuItem>
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
            <p className="text-slate-300">
              owner: {board.data?.project.owner.name}
            </p>
          </div>
          <div className="flex gap-4 overflow-y-hidden overflow-x-scroll pb-48 lg:gap-8 xl:gap-16">
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
                        .map((list) => (
                          <Draggable
                            key={list.id}
                            draggableId={list.id}
                            index={list.order}
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
                                    {...list}
                                    dateFilter={dateFilter}
                                    assignedFilter={assignedFilter}
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
                      isLoading={createList.isLoading}
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
  // const [date, onChange] = useState<Date | null>()

  const filterRef = useRef<HTMLDivElement>(null)
  useClickOutside([filterRef], closeFilter)

  const filterAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

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
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            ref={filterRef}
            {...filterAnimation}
            className="absolute right-0 z-30 origin-top-right whitespace-nowrap bg-zinc-900/95 p-4"
          >
            <fieldset className="flex items-center gap-1">
              <legend>task state</legend>
              <input
                type="radio"
                id="assigned_user"
                value="assigned_user"
                name="task_type"
                onChange={handleAssignedFilterChange}
                checked={assignedFilter === "assigned_user"}
                className="peer/assigned_user hidden"
              />
              <label
                htmlFor="assigned_user"
                className="cursor-pointer border border-zinc-700 px-1 peer-checked/assigned_user:bg-zinc-700"
              >
                assigned to me
              </label>
              <input
                type="radio"
                id="assigned"
                value="assigned"
                name="task_type"
                onChange={handleAssignedFilterChange}
                checked={assignedFilter === "assigned"}
                className="peer/assigned hidden"
              />
              <label
                htmlFor="assigned"
                className="cursor-pointer border border-zinc-700 px-1 peer-checked/assigned:bg-zinc-700"
              >
                assigned
              </label>
              <input
                type="radio"
                id="unassigned"
                value="unassigned"
                name="task_type"
                onChange={handleAssignedFilterChange}
                checked={assignedFilter === "unassigned"}
                className="peer/unassigned hidden"
              />
              <label
                htmlFor="unassigned"
                className="cursor-pointer border border-zinc-700 px-1 peer-checked/unassigned:bg-zinc-700"
              >
                unassigned
              </label>
            </fieldset>
            <fieldset className="flex flex-wrap items-center gap-1">
              <legend>due to</legend>
              <input
                type="radio"
                id="tomorrow"
                value="tomorrow"
                name="due_to"
                disabled={Boolean(dateFilter instanceof Date)}
                checked={dateFilter === "tomorrow"}
                onChange={handleDateFilterChange}
                className="peer/tomorrow hidden"
              />
              <label
                htmlFor="tomorrow"
                className="cursor-pointer border border-zinc-700 px-1 peer-checked/tomorrow:bg-zinc-700 peer-disabled/tomorrow:bg-transparent"
              >
                tomorrow
              </label>
              <input
                type="radio"
                id="next_week"
                value="next_week"
                name="due_to"
                disabled={Boolean(dateFilter instanceof Date)}
                checked={dateFilter === "next_week"}
                onChange={handleDateFilterChange}
                className="peer/week hidden"
              />
              <label
                htmlFor="next_week"
                className="cursor-pointer border border-zinc-700 px-1 peer-checked/week:bg-zinc-700 peer-disabled/tomorrow:bg-transparent"
              >
                next week
              </label>
              <input
                type="radio"
                id="next_month"
                value="next_month"
                name="due_to"
                disabled={Boolean(dateFilter instanceof Date)}
                checked={dateFilter === "next_month"}
                onChange={handleDateFilterChange}
                className="peer/month hidden"
              />
              <label
                htmlFor="next_month"
                className="cursor-pointer border border-zinc-700 px-1 peer-checked/month:bg-zinc-700 peer-disabled/tomorrow:bg-transparent"
              >
                next month
              </label>
              <DateTimePicker
                onChange={setDateFilter}
                value={Boolean(dateFilter instanceof Date) ? dateFilter : null}
                disableClock
                calendarIcon={null}
                format="y-MM-dd h:mm a"
                className="border border-zinc-700"
              />
            </fieldset>
            <button
              onClick={clearFilters}
              className="mt-2 bg-zinc-700 px-2 py-1"
            >
              clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
