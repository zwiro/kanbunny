import { LayoutProvider } from "@/context/LayoutContext"
import Navbar from "./Navbar"
import { Jura } from "next/font/google"

const jura = Jura({ subsets: ["latin"], weight: ["400", "700"] })

interface LayoutProps {
  children: JSX.Element
}

function Layout({ children }: LayoutProps) {
  return (
    <LayoutProvider>
      <div
        className={`${jura.className} min-h-screen bg-zinc-700 text-slate-100`}
      >
        <Navbar />
        <main className="p-4">{children}</main>
      </div>
    </LayoutProvider>
  )
}

export default Layout
