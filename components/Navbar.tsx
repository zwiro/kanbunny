import { GiRabbit } from "react-icons/gi"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useContext } from "react"
import LayoutContext from "@/context/LayoutContext"
import { LoadingDots } from "./LoadingDots"
import FocusLock from "react-focus-lock"

function Navbar() {
  const { data: session, status } = useSession()

  const router = useRouter()

  const { isSideMenuOpen, toggleSideMenu } = useContext(LayoutContext)

  if (router.pathname === "/auth/login") return null

  return (
    <FocusLock group="aside-nav" disabled={!isSideMenuOpen}>
      <nav className="fixed top-0 z-20 flex h-20 w-full items-center gap-4 border-b border-neutral-700 bg-zinc-800 p-4 text-lg sm:text-2xl xl:px-12 2xl:px-24">
        {router.pathname !== "/auth/login" && (
          <>
            <button
              onClick={toggleSideMenu}
              className="py-2 transition-transform hover:scale-110 focus:scale-110"
              aria-label={`${isSideMenuOpen ? "Close" : "Open"} side menu`}
            >
              <BurgerMenu />
            </button>
            <div className="flex items-center">
              <GiRabbit className="h-8 w-8 xl:h-12 xl:w-12" />
              <h1 className="font-bold">kanbunny</h1>
            </div>
            {status === "loading" ? (
              <LoadingDots className="ml-auto" />
            ) : (
              <h2 className="ml-auto">{session?.user?.name}</h2>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="hover:underline focus:underline"
            >
              sign out
            </button>
          </>
        )}
      </nav>
    </FocusLock>
  )
}

function BurgerMenu() {
  const { isSideMenuOpen } = useContext(LayoutContext)
  return (
    <span
      className={`relative block h-0.5 w-6 bg-slate-100 transition-all before:absolute before:-top-2 before:left-0 before:h-0.5 before:w-6 before:bg-slate-100 before:transition-all after:absolute after:left-0 after:top-2 after:h-0.5 after:w-6 after:bg-slate-100 after:transition-all xl:w-8 before:xl:-top-3 before:xl:w-8 after:xl:top-3 after:xl:w-8 ${
        isSideMenuOpen &&
        "rotate-45 before:translate-y-2 before:rotate-90 after:-translate-y-2 after:-rotate-90 before:xl:translate-y-3 after:xl:-translate-y-3"
      } `}
    />
  )
}

export default Navbar
