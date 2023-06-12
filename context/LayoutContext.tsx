import { Color } from "@prisma/client"
import { createContext, useState } from "react"

type BoardContextType = {
  id: string
  color: Color
  name: string
  owner: string
}

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
  chosenBoard: { id: "", color: "red", name: "", owner: "" },
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

  const [chosenBoard, setchosenBoard] = useState<BoardContextType | undefined>(
    undefined
  )

  const chooseOpenedBoard = (board: BoardContextType) => {
    setchosenBoard(board)
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
