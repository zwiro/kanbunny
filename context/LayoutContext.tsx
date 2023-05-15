import { createContext, useState } from "react"

interface LayoutContextType {
  isSideMenuOpen: boolean
  toggleSideMenu: () => void
  closeSideMenu: () => void
  chosenBoardId: string | undefined
  chooseOpenedBoard: (boardId: string) => void
}

const LayoutContext = createContext<LayoutContextType>({
  isSideMenuOpen: false,
  toggleSideMenu: () => {},
  closeSideMenu: () => {},
  chosenBoardId: undefined,
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

  const [chosenBoardId, setChosenBoardId] = useState<string | undefined>(
    undefined
  )

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
