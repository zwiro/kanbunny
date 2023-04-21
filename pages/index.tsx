import { useSession } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import MenuDots from "@/components/MenuDots"
import PlusIcon from "@/components/PlusIcon"
import List from "@/components/List"
import SideMenu from "@/components/SideMenu"
import LayoutContext from "@/context/LayoutContext"
import { motion, AnimatePresence } from "framer-motion"
import Menu from "@/components/Menu"
import MenuItem from "@/components/MenuItem"
import MenuButton from "@/components/MenuButton"
import AddButton from "@/components/AddButton"
import useEdit from "@/hooks/useEdit"
import AddEditForm from "@/components/AddEditForm"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import useAdd from "@/hooks/useAdd"
import ListContainer from "@/components/ListContainer"

export default function Home() {
  const { isSideMenuOpen, closeSideMenu } = useContext(LayoutContext)
  const { isEditing, edit, cancelEdit } = useEdit()
  const { isAdding, add, cancelAdd } = useAdd()
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
  })

  const bgBlurAnimation = {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(10px)" },
    exit: { backdropFilter: "blur(0px)" },
  }

  return (
    <div
      onClick={() => {
        closeSideMenu()
      }}
      className="flex flex-col"
    >
      <div>
        <div className="flex items-center gap-4">
          {!isEditing ? (
            <>
              <h1 className="text-2xl font-bold">board name</h1>
              <MenuButton direction="right">
                <>
                  <MenuItem handleClick={edit}>edit board name</MenuItem>
                  <MenuItem handleClick={add}>add list</MenuItem>
                  <MenuItem>change color</MenuItem>
                  <MenuItem>delete board</MenuItem>
                </>
              </MenuButton>
            </>
          ) : (
            <div className="text-2xl [&>form>input]:py-1">
              <AddEditForm
                name="board-name"
                placeholder="board name"
                cancel={cancelEdit}
              />
            </div>
          )}

          <div className="ml-auto sm:hidden">
            <MenuButton>
              <>
                <MenuItem>sort</MenuItem>
                <MenuItem>filter</MenuItem>
                <MenuItem>search</MenuItem>
              </>
            </MenuButton>
          </div>
          <div className="ml-auto hidden sm:block">
            <ul className="flex gap-4 text-2xl md:gap-12 lg:gap-16">
              <li>sort</li>
              <li>filter</li>
              <li>search</li>
            </ul>
          </div>
        </div>
        <p className="text-slate-300">owner: zwiro</p>
      </div>
      <div className="flex min-h-[16rem] gap-4 overflow-x-scroll lg:gap-8 xl:gap-16">
        <List />
        <List />
        <List />
        {isAdding ? (
          <ListContainer>
            <AddEditForm
              name="list-name"
              placeholder="list name"
              cancel={cancelAdd}
            />
          </ListContainer>
        ) : (
          <AddButton handleClick={add}>
            <>
              new list <PlusIcon />
            </>
          </AddButton>
        )}
      </div>

      <AnimatePresence>
        {isSideMenuOpen && (
          <>
            <motion.div {...bgBlurAnimation} className="fixed inset-0" />
            <SideMenu />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
