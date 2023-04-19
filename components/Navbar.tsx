import Link from "next/link"
import { GiRabbit } from "react-icons/gi"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useContext } from "react"
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

function BurgerMenu() {
  const { isSideMenuOpen } = useContext(LayoutContext)
  return (
    <div
      className={`relative h-0.5 w-6 bg-slate-100 transition-all before:absolute before:-top-2 before:left-0 before:h-0.5 before:w-6 before:bg-slate-100 before:transition-all after:absolute after:left-0 after:top-2 after:h-0.5 after:w-6 after:bg-slate-100 after:transition-all ${
        isSideMenuOpen &&
        "rotate-45 before:translate-y-2 before:rotate-90 after:-translate-y-2 after:-rotate-90"
      } `}
    />
  )
}

function LoadingDots() {
  return (
    <div className="ml-auto flex justify-center gap-2 pt-2">
      <div className="h-2 w-2 animate-bounceLeft rounded-full bg-slate-100" />
      <div className="h-2 w-2 animate-bounceCenter rounded-full bg-slate-100" />
      <div className="h-2 w-2 animate-bounceRight rounded-full bg-slate-100" />
    </div>
  )
}

export default Navbar
