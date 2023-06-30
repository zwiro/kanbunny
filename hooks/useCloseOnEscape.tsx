import { useEffect } from "react"

export default function useCloseOnEscape(handler: () => void) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handler()
      }
    }
    document.addEventListener("keydown", (e) => handleEscape(e))
    return () => {
      document.removeEventListener("keydown", (e) => handleEscape(e))
    }
  }, [handler])
}
