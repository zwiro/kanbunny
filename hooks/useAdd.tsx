import { useState } from "react"

function useAdd() {
  const [isAdding, setIsAdding] = useState(false)

  const add = () => {
    setIsAdding(true)
  }

  const cancelAdd = () => {
    setIsAdding(false)
  }

  return { isAdding, add, cancelAdd }
}

export default useAdd
