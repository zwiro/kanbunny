import { type ChangeEvent, useContext, useRef, useState } from "react"
import { trpc } from "@/utils/trpc"
import { motion, AnimatePresence } from "framer-motion"
import { ProjectWithUsers } from "@/types/trpc"
import LayoutContext from "@/context/LayoutContext"
import useBooleanState from "@/hooks/useBooleanState"
import ColorDot from "./ColorDot"
import MenuWrapper from "./MenuWrapper"
import MenuItem from "./MenuItem"
import Filters from "./Filters"
import ListsPanel from "./ListsPanel"
import SideMenu from "./SideMenu"

interface DashboardProps {
  userProjects: ProjectWithUsers[] | undefined
  isLoading: boolean
}

function Dashboard({ userProjects, isLoading }: DashboardProps) {
  const dragAreaRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string | Date | null>(null)
  const [assignedFilter, setAssignedFilter] = useState<string | null>(null)

  const [hideEmptyLists, , disableHideEmptyLists, toggleHideEmptyLists] =
    useBooleanState()

  const { isSideMenuOpen, closeSideMenu, chosenBoard } =
    useContext(LayoutContext)

  const [isAdding, add, closeAdd] = useBooleanState()

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

  const search = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const resetQuery = () => {
    setSearchQuery("")
  }

  const backdropBlurAnimation = {
    initial: { backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" },
    animate: {
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    exit: { backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" },
  }

  return (
    <div
      ref={dragAreaRef}
      onClick={() => {
        closeSideMenu()
      }}
      className="flex flex-col overflow-auto"
    >
      {chosenBoard ? (
        <>
          <div className="sticky left-0 z-10 flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 [&>button]:cursor-default">
                  <ColorDot color={chosenBoard.color} />
                  <h2 className="max-w-xs break-words text-base font-bold sm:max-w-lg sm:text-2xl md:max-w-xl xl:max-w-4xl 2xl:max-w-6xl">
                    {chosenBoard.name}
                  </h2>
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
          <ListsPanel
            assignedFilter={assignedFilter}
            dateFilter={dateFilter}
            hideEmptyLists={hideEmptyLists}
            listMutationCounter={listMutationCounter}
            lists={lists.data}
            searchQuery={searchQuery}
            taskMutationCounter={taskMutationCounter}
            isLoading={lists.isLoading}
            isAdding={isAdding}
            closeAdd={closeAdd}
            add={add}
          />
        </>
      ) : (
        <h2 className="text-center font-bold text-neutral-300">
          open or create a new board
        </h2>
      )}
      <AnimatePresence>
        {isSideMenuOpen && (
          <>
            <motion.div
              {...backdropBlurAnimation}
              className="fixed inset-0 z-10 backdrop-blur transition-colors"
            />
            <SideMenu data={userProjects} isLoading={isLoading} />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard