import { useEffect, type RefObject } from "react"

export default function useClickOutside(
  refs: Array<RefObject<HTMLElement> | undefined>,
  handler?: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!handler) return

      if (
        event.target === document.getElementsByTagName("html")[0] &&
        event.clientX >= document.documentElement.offsetWidth
      )
        return

      let containedToAnyRefs = false
      for (const rf of refs) {
        if (rf && rf.current && rf.current.contains(event.target)) {
          containedToAnyRefs = true
          break
        }
      }

      if (!containedToAnyRefs) {
        handler()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [refs, handler])
}
