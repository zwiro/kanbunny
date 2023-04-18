import Link from "next/link"
import { GiRabbit } from "react-icons/gi"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"

function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (router.pathname === "/auth/login") return null

  if (status === "loading") {
    return <p>Hang on there...</p>
  }

  return (
    <nav className="bg-zinc-800">
      <GiRabbit />
      <Link href="/">{session?.user?.name}</Link>
      <button onClick={() => signOut()}>sign out</button>
    </nav>
  )
}

export default Navbar
