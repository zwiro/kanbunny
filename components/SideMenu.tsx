import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import useAddOrEdit from "@/hooks/useBooleanState"
import AddProjectModal from "./AddProjectModal"
import React, { useState } from "react"
import { LoadingDots } from "./LoadingDots"
import { useSession } from "next-auth/react"
import Project from "./Project"
import type { Board, ProjectUser, User } from "@prisma/client"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { trpc } from "@/utils/trpc"
import getProjectOrder from "@/utils/getProjectOrder"
import { get } from "http"
import { reorderProjects } from "@/mutations/projectMutations"

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
  const { data: session } = useSession()

  const [isAdding, add, closeAdd] = useAddOrEdit()

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
          <LoadingDots />
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
                                project={project}
                                boards={project.boards}
                                dragHandleProps={provided.dragHandleProps}
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
