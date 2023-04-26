import { useState, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import useClickOutside from "@/hooks/useClickOutside"
import { motion } from "framer-motion"

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

interface MenuProps {
  children: JSX.Element | JSX.Element[]
  direction: "left" | "right"
}

function Menu({ children, direction }: MenuProps) {
  const menuAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <motion.div
      {...menuAnimation}
      className={`absolute top-5 z-50 w-max origin-top-left bg-zinc-900/95 py-4 text-lg ${
        direction === "right"
          ? "left-0 origin-top-left"
          : "right-0 origin-top-right"
      } `}
    >
      <ul className="flex flex-col gap-2">{children}</ul>
    </motion.div>
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
