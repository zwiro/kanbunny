import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import MenuDots from "@/components/menuDots"
import PlusIcon from "@/components/plusIcon"
import List from "@/components/list"
import SideMenu from "@/components/sideMenu"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
  })

  return (
    <div className="flex flex-col">
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
      <button className="group mx-auto mt-4 flex items-center gap-2 border border-neutral-800 bg-zinc-800 p-4 text-lg font-bold transition-colors hover:bg-zinc-900">
        new list <PlusIcon />
      </button>
      <SideMenu />
    </div>
  )
}
