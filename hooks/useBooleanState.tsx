import { useState } from "react"

function useBooleanState() {
  const [booleanState, setBooleanState] = useState(false)

  const setTrue = () => {
    setBooleanState(true)
  }

  const setFalse = () => {
    setBooleanState(false)
  }

  return [booleanState, setTrue, setFalse] as const
}

export default useBooleanState
