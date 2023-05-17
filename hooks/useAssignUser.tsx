import { useState } from "react"

function useAssignUser(initialState: string[] = []) {
  const [assignedUsers, setAssignedUsers] = useState<string[]>(initialState)

  const assignUser = (userId: string) => {
    if (assignedUsers.includes(userId)) {
      setAssignedUsers((prevUsers) => prevUsers.filter((u) => u !== userId))
    } else {
      setAssignedUsers((prevUsers) => [...prevUsers, userId])
    }
  }

  return {
    assignUser,
    assignedUsers,
  }
}

export default useAssignUser
