import { createContext, useState } from "react"

interface MenuContextType {
  isMenuOpened: boolean
  openMenu: () => void
  closeMenu: () => void
}

const MenuContext = createContext<MenuContextType>({
  isMenuOpened: false,
  openMenu: () => {},
  closeMenu: () => {},
})

interface MenuProviderProps {
  children: React.ReactNode
}

export function MenuProvider({ children }: MenuProviderProps) {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const openMenu = () => {
    setIsMenuOpened(true)
  }
  const closeMenu = () => {
    setIsMenuOpened(false)
  }

  const value = {
    isMenuOpened,
    openMenu,
    closeMenu,
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export default MenuContext
