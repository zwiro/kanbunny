import { useState } from "react"

function useAddOrEdit() {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false)

  const addOrEdit = () => {
    setIsAddingOrEditing(true)
  }

  const cancelAddOrEdit = () => {
    setIsAddingOrEditing(false)
  }

  return [isAddingOrEditing, addOrEdit, cancelAddOrEdit] as const
}

export default useAddOrEdit
