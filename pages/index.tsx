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

export default function Home() {
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
        closeSideMenu()
      }}
      className="flex flex-col"
    >
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">board name</h1>
          <MenuButton direction="right">
            <>
              <MenuItem>edit board name</MenuItem>
              <MenuItem>add user</MenuItem>
              <MenuItem>change color</MenuItem>
              <MenuItem>delete board</MenuItem>
            </>
          </MenuButton>
          <div className="ml-auto">
            <MenuButton>
              <>
                <MenuItem>sort</MenuItem>
                <MenuItem>filter</MenuItem>
                <MenuItem>search</MenuItem>
              </>
            </MenuButton>
          </div>
        </div>
        <p className="text-slate-300">owner: zwiro</p>
      </div>
      <div className="flex gap-4 overflow-x-scroll">
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
