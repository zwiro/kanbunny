import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import AddProjectModal from "./AddProjectModal"
import React from "react"
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

interface SideMenuProps {
  data:
    | (Project & {
        owner: User
        boards: Board[]
        users: ProjectUser[]
        invited_users: User[]
      })[]
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

  const reorder = trpc.project.reorder.useMutation({
    onSuccess() {
      utils.project.getByUser.invalidate()
    },
  })

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!result.destination) {
      return
    }
    reorder.mutate({
      projectOneIndex: source.index,
      projectTwoIndex: destination!.index,
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
                  {data?.map((project, index) => (
                    <Draggable
                      key={project.id}
                      draggableId={project.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Project
                            project={project}
                            boards={project.boards}
                            participants={[
                              ...project.invited_users,
                              ...project.users.filter(
                                (user) => user.id !== session?.user.id
                              ),
                            ]}
                            dragHandleProps={provided.dragHandleProps}
                          />
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
