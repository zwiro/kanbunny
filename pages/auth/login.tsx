import { useSession, signIn } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/router"
import { AiFillGithub } from "react-icons/ai"
import Image from "next/image"
import loginBgImage from "@/public/login.jpg"

function AuthPage() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <div className="relative mx-auto grid h-[calc(100vh-4rem)] max-w-4xl place-items-center">
      <div>
        <Image alt="" src={loginBgImage} className="h-52 object-cover" />
        <div className="flex flex-col gap-8 bg-zinc-800 px-8 py-12 text-center text-2xl">
          <p>
            join <strong>kanbunny</strong> and start creating kanban boards
            today
          </p>
          <p>manage your projects efficiently</p>
          <p>invite your co-workers</p>
          <button
            onClick={() => signIn("github")}
            className="mx-8 flex items-center justify-center gap-1 bg-zinc-950 px-8 py-4 font-bold transition-colors hover:bg-zinc-900"
          >
            <AiFillGithub />
            sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
