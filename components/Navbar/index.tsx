import Link from "next/link"
import { GiRabbit } from "react-icons/gi"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useContext } from "react"
import LoadingDots from "../loadingDots"
import BurgerMenu from "../burgerMenu"
import LayoutContext from "@/context/LayoutContext"

function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const { toggleSideMenu } = useContext(LayoutContext)

  if (router.pathname === "/auth/login") return null

  return (
    <nav className="sticky top-0 z-20 flex items-center gap-4 border-b border-neutral-800 bg-zinc-800 p-4 text-lg">
      <button
        onClick={toggleSideMenu}
        className="py-2 transition-transform hover:scale-110"
      >
        <BurgerMenu />
      </button>
      <GiRabbit size={32} />
      {status === "loading" ? (
        <LoadingDots />
      ) : (
        <Link href="/" className="ml-auto hover:underline">
          {session?.user?.name}
        </Link>
      )}
      <button
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="hover:underline"
      >
        sign out
      </button>
    </nav>
  )
}

export default Navbar
