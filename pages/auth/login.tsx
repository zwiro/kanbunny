import { signIn } from "next-auth/react"
import { AiFillGithub } from "react-icons/ai"
import Image from "next/image"
import loginBgImage from "@/public/login.jpg"

function AuthPage() {
  return (
    <div className="relative mx-auto grid h-full max-w-4xl place-items-center">
      <div>
        <Image
          alt=""
          src={loginBgImage}
          className="h-32 object-cover sm:h-52"
        />
        <div className="flex flex-col gap-8 bg-zinc-800 px-8 py-12 text-center lg:text-2xl">
          <p>
            join <span className="font-bold">kanbunny</span> and start creating
            kanban boards today
          </p>
          <p>
            manage your <span className="font-bold">projects</span> efficiently
          </p>
          <p>
            <span className="font-bold">invite</span> your co-workers
          </p>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="mx-8 flex items-center justify-center gap-1 bg-zinc-950 px-8 py-4 font-bold transition-colors hover:bg-zinc-900 focus:bg-zinc-900"
          >
            <AiFillGithub />
            sign in with github
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
