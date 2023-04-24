import { useState } from "react"

function useInviteUser() {
  const [user, setUser] = useState<string>("")
  const [invitedUsers, setInvitedUsers] = useState<string[]>([])

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

  return { user, invitedUsers, inviteUser, removeUser, handleChange }
}

export default useInviteUser
