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

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
        invited_users: User[]
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

  const reorder = trpc.project.reorder.useMutation({
    async onMutate(input) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === input.draggableId
            ? { ...p, order: input.itemTwoIndex }
            : input.itemOneIndex > input.itemTwoIndex &&
              p.order >= input.itemTwoIndex &&
              p.order <= input.itemOneIndex
            ? { ...p, order: p.order + 1 }
            : input.itemOneIndex < input.itemTwoIndex &&
              p.order <= input.itemTwoIndex &&
              p.order >= input.itemOneIndex
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

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over) return
    if (active.id === over.id) return
    reorder.mutate({
      itemOneIndex: active.data.current?.sortable.index,
      itemTwoIndex: over.data.current?.sortable.index,
      draggableId: active.id as string,
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <>
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-16 w-11/12 bg-zinc-800 px-24 py-8 text-2xl lg:px-36 lg:text-3xl [&>button]:my-0"
      >
        {!isLoading ? (
          <AddButton onClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <LoadingDots />
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={data!} strategy={verticalListSortingStrategy}>
            {!!data?.length &&
              data
                ?.sort((a, b) => a.order - b.order)
                .map((project) => (
                  <Project
                    key={project.id}
                    project={project}
                    boards={project.boards}
                  />
                ))}
          </SortableContext>
        </DndContext>
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
