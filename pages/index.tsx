import { useEffect, useContext, useState } from "react"
import { useRouter } from "next/router"
import PlusIcon from "@/components/PlusIcon"
import List from "@/components/List"
import SideMenu from "@/components/SideMenu"
import LayoutContext from "@/context/LayoutContext"
import { motion, AnimatePresence } from "framer-motion"
import MenuItem from "@/components/MenuItem"
import MenuButton from "@/components/MenuButton"
import AddButton from "@/components/AddButton"
import AddEditForm from "@/components/AddEditForm"
import ListContainer from "@/components/ListContainer"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import { trpc } from "@/utils/trpc"
import { z } from "zod"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import ColorDot from "@/components/ColorDot"
import { listSchema } from "@/types/schemas"
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd"

export default function Home() {
  const { isSideMenuOpen, closeSideMenu, toggleSideMenu } =
    useContext(LayoutContext)

  const [isAdding, add, closeAdd] = useAddOrEdit()

  const { chosenBoardId } = useContext(LayoutContext)

  const utils = trpc.useContext()

  const userProjects = trpc.project.getByUser.useQuery()

  const board = trpc.board.getById.useQuery(chosenBoardId!, {
    enabled: !!chosenBoardId,
  })

  const createList = trpc.list.create.useMutation({
    async onMutate(createdList) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: [
              ...old?.lists!,
              { ...createdList, tasks: [], color: "blue" },
            ],
          } as any)
      )
      return { prevData }
    },
    onError(err, createdList, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      listMethods.reset()
      closeAdd()
      utils.board.getById.invalidate()
    },
  })

  type ListSchema = z.infer<typeof listSchema>

  const listMethods = useForm<ListSchema>({
    defaultValues: { boardId: chosenBoardId },
    resolver: zodResolver(listSchema),
  })

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

  const reorder = trpc.list.reorder.useMutation({
    async onMutate(input) {
      await utils.board.getById.cancel()
      const prevData = utils.board.getById.getData()
      utils.board.getById.setData(
        chosenBoardId!,
        (old) =>
          ({
            ...old,
            lists: old?.lists.map((l) =>
              l.id === input.draggableId
                ? { ...l, order: input.itemTwoIndex }
                : input.itemOneIndex > input.itemTwoIndex &&
                  l.order >= input.itemTwoIndex &&
                  l.order <= input.itemOneIndex
                ? { ...l, order: l.order + 1 }
                : input.itemOneIndex < input.itemTwoIndex &&
                  l.order <= input.itemTwoIndex &&
                  l.order >= input.itemOneIndex
                ? { ...l, order: l.order - 1 }
                : l
            ),
          } as any)
      )
      return { prevData }
    },
    onError(err, input, ctx) {
      utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    },
    onSettled() {
      utils.board.getById.invalidate()
    },
  })

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    // if (!result.destination || source?.index === destination?.index) {
    //   return
    // }
    console.log(source, destination)
    // reorder.mutate({
    //   itemOneIndex: source.index,
    //   itemTwoIndex: destination!.index,
    //   draggableId,
    // })
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
              <MenuButton direction="right">
                <MenuItem handleClick={add}>add list</MenuItem>
                <MenuItem handleClick={toggleSideMenu}>more options</MenuItem>
              </MenuButton>
              <Filters />
            </div>
            <p className="text-slate-300">
              owner: {board.data?.project.owner.name}
            </p>
          </div>
          <div className="flex gap-4 overflow-y-hidden overflow-x-scroll pb-48 lg:gap-8 xl:gap-16">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="lists" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex min-h-[16rem] gap-4 lg:gap-8 xl:gap-16"
                  >
                    <DragDropContext onDragEnd={onDragEnd}>
                      {!!board.data?.lists.length &&
                        board.data?.lists
                          .sort((a, b) => a.order - b.order)
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
                    </DragDropContext>

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
    <>
      <div className="ml-auto hidden sm:block">
        <ul className="flex gap-4 text-2xl md:gap-12 lg:gap-16">
          <li>sort</li>
          <li>filter</li>
          <li>search</li>
        </ul>
      </div>
      <div className="ml-auto sm:hidden">
        <MenuButton>
          <MenuItem>sort</MenuItem>
          <MenuItem>filter</MenuItem>
          <MenuItem>search</MenuItem>
        </MenuButton>
      </div>
    </>
  )
}
