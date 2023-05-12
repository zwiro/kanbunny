import { createContext, useState } from "react"

interface LayoutContextType {
  isSideMenuOpen: boolean
  toggleSideMenu: () => void
  closeSideMenu: () => void
  chosenBoardId: string | null
  chooseOpenedBoard: (boardId: string) => void
}

const LayoutContext = createContext<LayoutContextType>({
  isSideMenuOpen: false,
  toggleSideMenu: () => {},
  closeSideMenu: () => {},
  chosenBoardId: null,
  chooseOpenedBoard: () => {},
})

export function LayoutProvider({ children }: { children: JSX.Element }) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

  const toggleSideMenu = () => {
    setIsSideMenuOpen((prevOpen) => !prevOpen)
  }
  const closeSideMenu = () => {
    setIsSideMenuOpen(false)
  }

  const [chosenBoardId, setChosenBoardId] = useState<string | null>(null)

  const chooseOpenedBoard = (boardId: string) => {
    setChosenBoardId(boardId)
  }

  const value = {
    isSideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    chosenBoardId,
    chooseOpenedBoard,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export default LayoutContext
