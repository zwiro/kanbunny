import { useEffect, useContext, useState, useRef } from "react"
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
import useAddOrEdit from "@/hooks/useAddOrEdit"
import { trpc } from "@/utils/trpc"
import { z } from "zod"
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
import { AiOutlineFilter, AiOutlineSearch } from "react-icons/ai"

export default function Home() {
  const { isSideMenuOpen, closeSideMenu, toggleSideMenu } =
    useContext(LayoutContext)

  const [isAdding, add, closeAdd] = useAddOrEdit()

  const { chosenBoardId } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const lists = trpc.list.getByBoard.useQuery(chosenBoardId!)

  const userProjects = trpc.project.getByUser.useQuery()

  const board = trpc.board.getById.useQuery(chosenBoardId!, {
    enabled: !!chosenBoardId,
  })

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
    if (!destination) return
    if (source.droppableId === "board" || destination.droppableId === "board") {
      reorder.mutate({
        itemOneIndex: source.index,
        itemTwoIndex: destination.index,
        draggableId,
      })
    } else {
      reorderDisplayedTasks.mutate({
        itemOneIndex: source.index,
        itemTwoIndex: destination.index,
        listId: destination.droppableId,
        prevListId: source.droppableId,
        draggableId,
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
              <Filters />
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

function Filters() {
  return (
    <div className="ml-auto">
      <div className="flex items-center justify-end gap-1">
        <AiOutlineFilter size={32} />
        <div className="flex">
          <AiOutlineSearch size={32} />
          <input type="search" />
        </div>
      </div>
      {/* <div>
        <fieldset className="flex items-center gap-1">
          <legend>task state</legend>
          <input type="radio" id="assigned" value="assigned" name="task_type" />
          <label htmlFor="assigned">assigned</label>
          <input
            type="radio"
            id="unassigned"
            value="unassigned"
            name="task_type"
          />
          <label htmlFor="unassigned">unassigned</label>
        </fieldset>
        <fieldset className="flex items-center gap-1">
          <legend>due to</legend>
          <input type="radio" id="tomorrow" value="tomorrow" name="due_to" />
          <label htmlFor="tomorrow">tomorrow</label>
          <input type="radio" id="next_week" value="next_week" name="due_to" />
          <label htmlFor="next_week">next week</label>
          <input
            type="radio"
            id="next_month"
            value="next_month"
            name="due_to"
          />
          <label htmlFor="next_month">next month</label>
        </fieldset>
      </div> */}
    </div>
  )
}
