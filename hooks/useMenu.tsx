import { useState } from "react"

function useMenu() {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  function toggleMenu() {
    setIsMenuOpened((prevOpened) => !prevOpened)
  }

  return {
    isMenuOpened,
    toggleMenu,
  }
}

export default useMenu
