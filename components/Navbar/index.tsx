import Link from "next/link"
import { GiRabbit } from "react-icons/gi"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import LoadingDots from "../loadingDots"

function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (router.pathname === "/auth/login") return null

  if (status === "loading") {
    return <LoadingDots />
  }

  return (
    <nav className="sticky top-0 z-20 flex items-center gap-4 border-b border-neutral-800 bg-zinc-800 p-4 text-lg">
      <GiRabbit size={32} />
      <Link href="/" className="ml-auto hover:underline">
        {session?.user?.name}
      </Link>
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
