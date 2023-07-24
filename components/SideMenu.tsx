import { useContext, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { trpc } from "@/utils/trpc"
import { reorderProjects } from "@/mutations/projectMutations"
import FocusLock from "react-focus-lock"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import dynamic from "next/dynamic"
import { ProjectWithUsers } from "@/types/trpc"
import LayoutContext from "@/context/LayoutContext"
import useBooleanState from "@/hooks/useBooleanState"
import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import ProjectSkeleton from "./ProjectSkeleton"
import AddProjectModal from "./AddProjectModal"
const Project = dynamic(() => import("@/components/Project"), {
  ssr: false,
  loading: () => <ProjectSkeleton width={200} />,
})

interface SideMenuProps {
  data: ProjectWithUsers[] | undefined
  isLoading: boolean
}

function SideMenu({ data, isLoading }: SideMenuProps) {
  const [isAdding, add, closeAdd] = useBooleanState()

  const { chosenBoard, chooseOpenedBoard } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const projectMutationCounter = useRef(0)

  const reorder = reorderProjects(utils, projectMutationCounter)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!active || !over) return
    if (active.id !== over.id) {
      setDisplayedProjects((projects) => {
        if (!projects) return projects
        const oldIndex = projects.map((p) => p.id).indexOf(active.id as string)
        const newIndex = projects.map((p) => p.id).indexOf(over.id as string)
        return arrayMove(projects, oldIndex, newIndex)
      })
      return reorder.mutate({
        itemOneIndex: active.data.current!.sortable.index,
        itemTwoIndex: over.data.current!.sortable.index,
        draggableId: active.id as string,
      })
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const sideMenuAnimation = {
    initial: { x: "-100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
    transition: { type: "tween" },
  }

  const [displayedProjects, setDisplayedProjects] = useState(data)

  useEffect(() => {
    setDisplayedProjects(data)
  }, [data])

  useEffect(() => {
    if (
      chosenBoard &&
      !data
        ?.map((p) => p.boards.map((b) => b.id))
        .flat()
        .includes(chosenBoard.id)
    ) {
      chooseOpenedBoard(undefined)
    }
  }, [chosenBoard, data, chooseOpenedBoard])

  return (
    <FocusLock group="aside-nav" autoFocus={false}>
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-0 z-10 w-11/12 overflow-y-scroll bg-zinc-800 px-4 py-8 pt-24 text-base sm:text-2xl lg:w-8/12 lg:px-24 lg:text-3xl xl:w-6/12 xl:px-36 [&>button]:my-0"
      >
        {!isLoading ? (
          <AddButton onClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <>
            <div className=" mx-auto h-[68px] w-[164px] animate-pulse bg-zinc-900 px-4 py-5" />
            <ProjectSkeleton width={60} />
            <ProjectSkeleton width={120} />
            <ProjectSkeleton width={180} />
          </>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={displayedProjects!.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {displayedProjects?.map((project) => (
                <Project
                  key={project.id}
                  isReordering={reorder.isLoading}
                  mutationCounter={projectMutationCounter}
                  {...project}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
        {!displayedProjects?.length && !isLoading && (
          <p className="pt-12 text-center text-neutral-300">no projects yet</p>
        )}
      </motion.aside>
      <AnimatePresence>
        {isAdding && <AddProjectModal close={closeAdd} />}
      </AnimatePresence>
    </FocusLock>
  )
}

export default SideMenu
