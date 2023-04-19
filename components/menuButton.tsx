import { useState, useEffect, useRef } from "react"
import Menu from "./menu"
import MenuDots from "./menuDots"
import { AnimatePresence } from "framer-motion"
import MenuItem from "./menuItem"

interface MenuButtonProps {
  children: JSX.Element
  direction?: "left" | "right"
}

function MenuButton({ children, direction = "left" }: MenuButtonProps) {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current) {
        setIsMenuOpened(false)
      }
    }
    document.addEventListener("click", handleClickOutside, true)
    return () => {
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [menuRef])

  return (
    <div className="relative">
      <button onClick={() => setIsMenuOpened(true)} className="py-4">
        <MenuDots />
      </button>
      <AnimatePresence>
        {isMenuOpened && (
          <div ref={menuRef}>
            <Menu direction={direction}>{children}</Menu>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MenuButton
