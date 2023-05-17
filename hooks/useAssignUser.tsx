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

  const assignUsers = (users: string[]) => {
    setAssignedUsers(users)
  }

  return {
    assignUser,
    assignedUsers,
    assignUsers,
  }
}

export default useAssignUser
