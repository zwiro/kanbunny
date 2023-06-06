import { useState } from "react"

function useToggle() {
  const [booleanState, setBooleanState] = useState(false)

  const toggle = () => {
    setBooleanState((prevState) => !prevState)
  }

  return [booleanState, toggle] as const
}

export default useToggle
