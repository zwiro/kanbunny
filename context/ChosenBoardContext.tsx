import { createContext, useState } from "react"

interface ChosenBoardContextType {
  chosenBoardId: string | null
  chooseOpenedBoard: (boardId: string) => void
}

const ChosenBoardContext = createContext<ChosenBoardContextType>({
  chosenBoardId: null,
  chooseOpenedBoard: () => {},
})

export function ChosenBoardProvider({ children }: { children: JSX.Element }) {
  const [chosenBoardId, setChosenBoardId] = useState<string | null>(null)

  const chooseOpenedBoard = (boardId: string) => {
    setChosenBoardId(boardId)
  }

  const value = {
    chosenBoardId,
    chooseOpenedBoard,
  }

  return (
    <ChosenBoardContext.Provider value={value}>
      {children}
    </ChosenBoardContext.Provider>
  )
}

export default ChosenBoardContext
