import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
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
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import ListContainer from "@/components/ListContainer"
import AddTaskModal from "@/components/AddTaskModal"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import { trpc } from "@/utils/trpc"
import { z } from "zod"

export const listSchema = z.object({
  name: z.string().min(1, { message: "list name is required" }),
  boardId: z.string(),
})

type ListSchema = z.infer<typeof listSchema>

export default function Home() {
  const { isSideMenuOpen, closeSideMenu } = useContext(LayoutContext)
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isAdding, add, closeAdd] = useAddOrEdit()
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
  })
  const { chosenBoardId } = useContext(LayoutContext)

  const userProjects = trpc.project.getByUser.useQuery()
  const board = trpc.board.getById.useQuery(chosenBoardId!)

  const bgBlurAnimation = {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(10px)" },
    exit: { backdropFilter: "blur(0px)" },
  }
  console.log(board.data?.lists)

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
              {!isEditingName ? (
                <>
                  <h1 className="text-2xl font-bold">{board.data?.name}</h1>
                  <MenuButton direction="right">
                    <MenuItem handleClick={editName}>edit board name</MenuItem>
                    <MenuItem handleClick={add}>add list</MenuItem>
                    <MenuItem>change color</MenuItem>
                    <MenuItem>delete board</MenuItem>
                  </MenuButton>
                </>
              ) : (
                <div className="[&>form>input]:py-1">
                  <AddEditForm
                    name="board-name"
                    placeholder="board name"
                    close={closeEditName}
                  />
                </div>
              )}
              <Filters />
            </div>
            <p className="text-slate-300">
              owner: {board.data?.project.owner.name}
            </p>
          </div>

          <div className="flex min-h-[16rem] gap-4 overflow-x-scroll lg:gap-8 xl:gap-16">
            {!!board.data?.lists.length &&
              board.data?.lists.map((list) => <List key={list.id} {...list} />)}
            {isAdding ? (
              <ListContainer>
                <AddEditForm
                  name="list-name"
                  placeholder="list name"
                  close={closeAdd}
                />
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
