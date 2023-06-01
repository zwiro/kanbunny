import { useState } from "react"

function useAddUser(initialState: string[] = []) {
  const [user, setUser] = useState<string>("")
  const [users, setUsers] = useState<string[]>(initialState)

  const addUser = (e: React.MouseEvent) => {
    e.preventDefault()
    if (user) {
      setUsers([...users, user])
      setUser("")
    }
  }

  const removeUser = (user: string) => {
    setUsers((prevUsers) => prevUsers.filter((prevUser) => prevUser !== user))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value)
  }

  const setAllUsers = (state: string[]) => {
    setUsers(state)
  }

  return {
    user,
    users,
    addUser,
    removeUser,
    handleChange,
    setAllUsers,
  }
}

export default useAddUser
