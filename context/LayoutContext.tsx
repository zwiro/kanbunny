import { createContext, useState } from "react"

const LayoutContext = createContext({
  isSideMenuOpen: false,
  toggleSideMenu: () => {},
  closeSideMenu: () => {},
})

export function LayoutProvider({ children }: { children: JSX.Element }) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const toggleSideMenu = () => {
    setIsSideMenuOpen((prevOpen) => !prevOpen)
  }
  const closeSideMenu = () => {
    setIsSideMenuOpen(false)
  }

  const value = {
    isSideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export default LayoutContext
