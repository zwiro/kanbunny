import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import useAddOrEdit from "@/hooks/useAddOrEdit"
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
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      console.log(input)
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === input.draggableId
            ? { ...p, order: input.projectTwoIndex }
            : input.projectOneIndex > input.projectTwoIndex &&
              p.order >= input.projectTwoIndex &&
              p.order <= input.projectOneIndex
            ? { ...p, order: p.order + 1 }
            : input.projectOneIndex < input.projectTwoIndex &&
              p.order <= input.projectTwoIndex &&
              p.order >= input.projectOneIndex
            ? { ...p, order: p.order - 1 }
            : p
        )
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
    },
  })

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!result.destination || source?.index === destination?.index) {
      return
    }
    reorder.mutate({
      projectOneIndex: source.index,
      projectTwoIndex: destination!.index,
      draggableId,
    })
  }

  // add animation, optimistic update

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
                        {(provided) => (
                          <div
                            className="draggable"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <Project
                              key={project.id}
                              project={project}
                              boards={project.boards}
                              index={project.order}
                              dragHandleProps={provided.dragHandleProps}
                              participants={[
                                ...project.invited_users,
                                ...project.users.filter(
                                  (user) => user.id !== session?.user.id
                                ),
                              ]}
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
