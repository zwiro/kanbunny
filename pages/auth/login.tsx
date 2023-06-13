import { useSession, signIn } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/router"

function AuthPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push("/")
  }, [router, session])

  return (
    <>
      <button onClick={() => signIn("github")}>Sign in</button>
    </>
  )
}

export default AuthPage
