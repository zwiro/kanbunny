import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import MenuDots from "@/components/menuDots"
import PlusIcon from "@/components/plusIcon"
import List from "@/components/list"
import SideMenu from "@/components/sideMenu"
import AddButton from "@/components/addButton"
import LayoutContext from "@/context/LayoutContext"
import { motion, AnimatePresence } from "framer-motion"
import Menu from "@/components/menu"
import MenuItem from "@/components/menuItem"
import { MenuType } from "@/types"

export default function Home() {
  const [openedMenu, setOpenedMenu] = useState<MenuType | null>(null)
  const { isSideMenuOpen, closeSideMenu } = useContext(LayoutContext)

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
        setOpenedMenu(null)
        closeSideMenu()
      }}
      className="flex flex-col"
    >
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">board name</h1>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenedMenu(MenuType.BOARD)
              }}
              className="py-2"
            >
              <MenuDots />
            </button>
            <AnimatePresence>
              {openedMenu === MenuType.BOARD && (
                <Menu>
                  <>
                    <MenuItem>Edit board name</MenuItem>
                    <MenuItem>Add user</MenuItem>
                    <MenuItem>Change color</MenuItem>
                    <MenuItem>Delete board</MenuItem>
                  </>
                </Menu>
              )}
            </AnimatePresence>
          </div>
          <div className="relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpenedMenu(MenuType.FILTERS)
              }}
              className="py-2"
            >
              <MenuDots />
            </button>
            <AnimatePresence>
              {openedMenu === MenuType.FILTERS && (
                <Menu direction="left">
                  <>
                    <MenuItem>Edit board name</MenuItem>
                    <MenuItem>Add user</MenuItem>
                    <MenuItem>Change color</MenuItem>
                    <MenuItem>Delete board</MenuItem>
                  </>
                </Menu>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-slate-300">owner: zwiro</p>
      </div>
      <div className="flex flex-col justify-center">
        <List />
        <List />
        <List />
      </div>
      <AddButton>
        <>
          new list <PlusIcon />
        </>
      </AddButton>
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
