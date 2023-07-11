import { useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { trpc } from "@/utils/trpc"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { reorderProjects } from "@/mutations/projectMutations"
import FocusLock from "react-focus-lock"
import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import useBooleanState from "@/hooks/useBooleanState"
import AddProjectModal from "./AddProjectModal"
import Project from "./Project"
import ProjectSkeleton from "./ProjectSkeleton"
import { ProjectWithUsers } from "@/types/trpc"

interface SideMenuProps {
  data: ProjectWithUsers[] | undefined
  isLoading: boolean
}

function SideMenu({ data, isLoading }: SideMenuProps) {
  const [isAdding, add, closeAdd] = useBooleanState()

  const sideMenuAnimation = {
    initial: { x: "-100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
    transition: { type: "tween" },
  }

  const utils = trpc.useContext()

  const projectMutationCounter = useRef(0)

  const reorder = reorderProjects(utils, projectMutationCounter)

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || source.index === destination.index) {
      return
    }
    reorder.mutate({
      itemOneIndex: source.index,
      itemTwoIndex: destination.index,
      draggableId,
    })
  }

  return (
    <FocusLock group="aside-nav">
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-0 z-40 w-11/12 overflow-y-scroll bg-zinc-800 px-4 py-8 pt-24 text-2xl lg:w-8/12 lg:px-24 lg:text-3xl xl:w-6/12 xl:px-36 [&>button]:my-0"
      >
        {!isLoading ? (
          <AddButton onClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <>
            <div className=" mx-auto h-[68px] w-[164px] animate-pulse bg-zinc-900 px-4 py-5 lg:mx-0" />
            <ProjectSkeleton width={60} />
            <ProjectSkeleton width={120} />
            <ProjectSkeleton width={180} />
          </>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          {!!data?.length && (
            <Droppable droppableId="projects">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {data
                    ?.sort((a, b) => a.order - b.order)
                    .map((project) => (
                      <Draggable
                        key={project.id}
                        draggableId={project.id}
                        index={project.order}
                      >
                        {(provided, snapshot) => (
                          <div
                            className="draggable"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <motion.div
                              animate={{
                                rotate: snapshot.isDragging ? -5 : 0,
                              }}
                            >
                              <Project
                                key={project.id}
                                dragHandleProps={provided.dragHandleProps}
                                mutationCounter={projectMutationCounter}
                                {...project}
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
          )}
        </DragDropContext>
        {!data?.length && !isLoading && (
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
