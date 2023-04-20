import { useState } from "react"

function useEdit() {
  const [isEditing, setIsEditing] = useState(false)

  const edit = () => {
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  return { isEditing, edit, cancelEdit }
}

export default useEdit
