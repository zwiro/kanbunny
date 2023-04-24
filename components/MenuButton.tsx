import { useState, useEffect, useRef } from "react"
import Menu from "./Menu"
import { AnimatePresence } from "framer-motion"

interface MenuButtonProps {
  children: JSX.Element | JSX.Element[]
  direction?: "left" | "right"
}

function MenuButton({ children, direction = "left" }: MenuButtonProps) {
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = () => {
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
      <button onClick={() => setIsMenuOpened(true)} className="px-1 py-4">
        <MenuDots isMenuOpened={isMenuOpened} />
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

interface MenuDotsProps {
  isMenuOpened: boolean
}

function MenuDots({ isMenuOpened }: MenuDotsProps) {
  return (
    <div
      className={`relative h-1 w-1 bg-slate-100 before:absolute before:-top-2 before:left-0 before:h-1 before:w-1 before:bg-slate-100 before:transition-all after:absolute after:left-0 after:top-2 after:h-1 after:w-1 after:bg-slate-100 after:transition-all ${
        isMenuOpened && "before:translate-y-2 after:-translate-y-2"
      } `}
    />
  )
}

export default MenuButton
