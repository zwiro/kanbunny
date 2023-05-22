import { useState } from "react"

export default function useExpand(initialState = true) {
  const [isExpanded, setIsExpanded] = useState(initialState)

  const toggle = () => setIsExpanded((prevExpanded) => !prevExpanded)

  return { isExpanded, toggle }
}
