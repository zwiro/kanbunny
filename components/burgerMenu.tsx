import LayoutContext from "@/context/LayoutContext"
import { useContext } from "react"

function BurgerMenu() {
  const { isSideMenuOpen } = useContext(LayoutContext)
  return (
    <div
      className={`relative h-0.5 w-6 bg-slate-100 transition-all before:absolute before:-top-2 before:left-0 before:h-0.5 before:w-6 before:bg-slate-100 before:transition-all after:absolute after:left-0 after:top-2 after:h-0.5 after:w-6 after:bg-slate-100 after:transition-all ${
        isSideMenuOpen &&
        "rotate-45 before:translate-y-2 before:rotate-90 after:-translate-y-2 after:-rotate-90"
      } `}
    />
  )
}

export default BurgerMenu
