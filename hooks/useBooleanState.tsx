import { useState } from "react"

function useBooleanState() {
  const [booleanState, setBooleanState] = useState(false)

  const setTrue = () => {
    setBooleanState(true)
  }

  const setFalse = () => {
    setBooleanState(false)
  }

  const toggle = () => {
    setBooleanState((prevState) => !prevState)
  }

  return [booleanState, setTrue, setFalse, toggle] as const
}

export default useBooleanState
