import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) router.push("/auth/login")
  }, [router, session])

  return (
    <>
      <div>main</div>
    </>
  )
}
