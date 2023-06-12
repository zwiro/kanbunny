import { LayoutProvider } from "@/context/LayoutContext"
import { Jura } from "next/font/google"
import Navbar from "./Navbar"

const jura = Jura({ subsets: ["latin"], weight: ["400", "700"] })

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <LayoutProvider>
      <div
        className={`${jura.className} min-h-screen bg-zinc-700 text-slate-100`}
      >
        <Navbar />
        <main className="p-4 xl:px-12 2xl:px-24">{children}</main>
      </div>
    </LayoutProvider>
  )
}

export default Layout
