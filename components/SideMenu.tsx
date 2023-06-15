import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import useBooleanState from "@/hooks/useBooleanState"
import AddProjectModal from "./AddProjectModal"
import React from "react"
import { LoadingDots } from "./LoadingDots"
import Project from "./Project"
import type { Board, User } from "@prisma/client"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { trpc } from "@/utils/trpc"
import { reorderProjects } from "@/mutations/projectMutations"
import ProjectSkeleton from "./ProjectSkeleton"

interface SideMenuProps {
  data:
    | {
        order: number
        id: string
        name: string
        ownerId: string
        created_at: Date
        updated_at: Date
        owner: User
        boards: Board[]
        users: {
          order: number
        }[]
      }[]
    | undefined
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

  const reorder = reorderProjects(utils)

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
    <>
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-16 w-11/12 overflow-y-scroll bg-zinc-800 px-24 py-8 text-2xl lg:px-36 lg:text-3xl [&>button]:my-0"
      >
        {!isLoading ? (
          <AddButton onClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <>
            <div className=" mx-auto h-[68px] w-[164px] animate-pulse bg-zinc-900 px-4 py-5 lg:mx-0" />
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
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
          <p className="text-netural-500 text-center">no projects yet</p>
        )}
      </motion.aside>
      <AnimatePresence>
        {isAdding && <AddProjectModal close={closeAdd} />}
      </AnimatePresence>
    </>
  )
}

export default SideMenu
