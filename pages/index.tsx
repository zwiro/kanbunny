import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/router"
import MenuDots from "@/components/menuDots"
import PlusIcon from "@/components/plusIcon"
import List from "@/components/list"
import SideMenu from "@/components/sideMenu"
import AddButton from "@/components/addButton"
import LayoutContext from "@/context/LayoutContext"
import { AnimatePresence } from "framer-motion"

export default function Home() {
  const { isSideMenuOpen, closeSideMenu } = useContext(LayoutContext)

  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
  })

  return (
    <div onClick={closeSideMenu} className="flex flex-col">
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">board name</h1>
          <MenuDots />
          <div className="ml-auto pr-3">
            <MenuDots />
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
      <AnimatePresence>{isSideMenuOpen && <SideMenu />}</AnimatePresence>
    </div>
  )
}
