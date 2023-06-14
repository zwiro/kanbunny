import type { Color } from "@prisma/client"
import { createContext, useState } from "react"

type BoardContextType =
  | {
      id: string
      color: Color
      name: string
      owner: string
    }
  | undefined

interface LayoutContextType {
  isSideMenuOpen: boolean
  toggleSideMenu: () => void
  closeSideMenu: () => void
  chosenBoard: BoardContextType | undefined
  chooseOpenedBoard: (board: BoardContextType) => void
}

const LayoutContext = createContext<LayoutContextType>({
  isSideMenuOpen: false,
  toggleSideMenu: () => {},
  closeSideMenu: () => {},
  chosenBoard: undefined,
  chooseOpenedBoard: () => {},
})

interface LayoutProviderProps {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

  const toggleSideMenu = () => {
    setIsSideMenuOpen((prevOpen) => !prevOpen)
  }
  const closeSideMenu = () => {
    setIsSideMenuOpen(false)
  }

  const [chosenBoard, setChosenBoard] = useState<BoardContextType | undefined>(
    undefined
  )

  const chooseOpenedBoard = (board: BoardContextType) => {
    setChosenBoard(board)
  }

  const value = {
    isSideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    chosenBoard,
    chooseOpenedBoard,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

export default LayoutContext
