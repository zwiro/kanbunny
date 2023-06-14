import { useReducer } from "react"

type Action =
  | {
      type: "ADD_USER"
      payload: { e: React.MouseEvent }
    }
  | { type: "REMOVE_USER"; payload: { user: string } }
  | { type: "SET_ALL_USERS"; payload: { state: string[] } }
  | {
      type: "HANDLE_CHANGE"
      payload: { e: React.ChangeEvent<HTMLInputElement> }
    }

type State = {
  user: string
  users: string[]
}

function useAddUser(initialState: State = { user: "", users: [] }) {
  function reducer(state = initialState, action: Action) {
    switch (action.type) {
      case "ADD_USER":
        action.payload.e.preventDefault()
        if (state.user) {
          return {
            user: "",
            users: [...state.users, state.user],
          }
        } else {
          return state
        }
      case "REMOVE_USER":
        const updatedUsers = state.users.filter(
          (prevUser) => prevUser !== action.payload.user
        )
        return {
          ...state,
          users: updatedUsers,
        }
      case "SET_ALL_USERS":
        return {
          ...state,
          users: action.payload.state,
        }
      case "HANDLE_CHANGE":
        const newUser = action.payload.e.target.value
        return {
          ...state,
          user: newUser,
        }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  const addUser = (e: React.MouseEvent) => {
    dispatch({ type: "ADD_USER", payload: { e } })
  }

  const removeUser = (user: string) => {
    dispatch({ type: "REMOVE_USER", payload: { user } })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "HANDLE_CHANGE", payload: { e } })
  }

  const setAllUsers = (state: string[]) => {
    dispatch({ type: "SET_ALL_USERS", payload: { state } })
  }

  return {
    user: state.user,
    users: state.users,
    addUser,
    removeUser,
    handleChange,
    setAllUsers,
  }
}

export default useAddUser
