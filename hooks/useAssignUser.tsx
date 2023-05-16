import { useState } from "react"

function useAssignUser() {
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])

  const assignUser = (user: string) => {
    if (assignedUsers.includes(user)) {
      setAssignedUsers((prevUsers) => prevUsers.filter((u) => u !== user))
    } else {
      setAssignedUsers((prevUsers) => [...prevUsers, user])
    }
  }

  return {
    assignUser,
    assignedUsers,
  }
}

export default useAssignUser
