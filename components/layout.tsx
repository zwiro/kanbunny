import { LayoutProvider } from "@/context/LayoutContext"
import { Jura } from "next/font/google"
import Navbar from "./Navbar"
import Head from "next/head"
import { useSession } from "next-auth/react"

const jura = Jura({ subsets: ["latin"], weight: ["400", "700"] })

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  const { data: session } = useSession()
  const title = `kanbunny ${session ? `| ${session.user.name}` : ""}`

  return (
    <LayoutProvider>
      <Head>
        <title>{title}</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="images/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="images/favicon-16x16.png"
        />
        <link rel="manifest" href="images/site.webmanifest" />
        <link
          rel="mask-icon"
          href="images/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta
          name="description"
          content="Boost your productivity and streamline your workflow with our intuitive kanban board application. Visualize your tasks, track progress, and collaborate seamlessly with team members. Stay organized and in control of your projects, whether you're working solo or as part of a team. Try kanbunny today and experience the power of efficient task management."
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div
        className={`${jura.className} h-screen overflow-y-scroll bg-zinc-700 text-slate-100`}
      >
        <Navbar />
        <main className="p-4 xl:px-12 2xl:px-24">{children}</main>
      </div>
    </LayoutProvider>
  )
}

export default Layout
