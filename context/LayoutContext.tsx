import { createContext, useState } from "react"

const LayoutContext = createContext({
  isSideMenuOpen: false,
  toggleSideMenu: () => {},
})

export function LayoutProvider({ children }: { children: JSX.Element }) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)
  const toggleSideMenu = () => {
    setIsSideMenuOpen((prevOpen) => !prevOpen)
  }

  const value = {
    isSideMenuOpen,
    toggleSideMenu,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export default LayoutContext
