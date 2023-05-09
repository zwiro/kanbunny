import { useState } from "react"

function useInviteUser(initialState: string[] = []) {
  const [user, setUser] = useState<string>("")
  const [invitedUsers, setInvitedUsers] = useState<string[]>(initialState)

  const inviteUser = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      setInvitedUsers([...invitedUsers, user])
      setUser("")
    }
  }

  const removeUser = (user: string) => {
    setInvitedUsers((prevUsers) =>
      prevUsers.filter((prevUser) => prevUser !== user)
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value)
  }

  const resetUsers = () => {
    setInvitedUsers([])
  }

  return {
    user,
    invitedUsers,
    inviteUser,
    removeUser,
    handleChange,
    resetUsers,
  }
}

export default useInviteUser
