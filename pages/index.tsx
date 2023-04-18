import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import MenuDots from "@/components/menuDots"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
  })

  return (
    <>
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">board name</h1>
          <MenuDots />
          <div className="ml-auto pr-3">
            <MenuDots />
          </div>
        </div>
        <p className="text-slate-300">owner: zwiro</p>
      </div>
    </>
  )
}
