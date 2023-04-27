import { useState } from "react"

function useAddOrEdit() {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false)

  const addOrEdit = () => {
    setIsAddingOrEditing(true)
  }

  const closeAddOrEdit = () => {
    setIsAddingOrEditing(false)
  }

  return [isAddingOrEditing, addOrEdit, closeAddOrEdit] as const
}

export default useAddOrEdit
