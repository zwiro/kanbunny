import Navbar from "./Navbar"
import { Jura } from "next/font/google"

const jura = Jura({ subsets: ["latin"], weight: ["400", "700"] })

interface LayoutProps {
  children: JSX.Element
}

function Layout({ children }: LayoutProps) {
  return (
    <div className={jura.className}>
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default Layout
