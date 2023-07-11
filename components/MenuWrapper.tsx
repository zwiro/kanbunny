import { useRef, useContext, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useClickOutside from "@/hooks/useClickOutside"
import MenuContext, { MenuProvider } from "@/context/MenuContext"
import useCloseOnEscape from "@/hooks/useCloseOnEscape"

interface MenuWrapperProps {
  children: React.ReactNode
  isLoading?: boolean
}

function MenuWrapper({ children, isLoading = false }: MenuWrapperProps) {
  return (
    <MenuProvider>
      <MenuButton isLoading={isLoading}>{children}</MenuButton>
    </MenuProvider>
  )
}

interface MenuButtonProps {
  children: React.ReactNode
  isLoading?: boolean
}

function MenuButton({ children, isLoading = false }: MenuButtonProps) {
  const { isMenuOpened, closeMenu, openMenu } = useContext(MenuContext)

  useCloseOnEscape(closeMenu)

  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside([menuRef], closeMenu)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          openMenu()
        }}
        className="px-1 py-4"
        disabled={isLoading}
        aria-label="Open menu"
      >
        <MenuDots isMenuOpened={isMenuOpened} />
      </button>
      <AnimatePresence>
        {isMenuOpened && (
          <div ref={menuRef}>
            <Menu>{children}</Menu>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MenuProps {
  children: React.ReactNode
}

function Menu({ children }: MenuProps) {
  const menuAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  const menuRef = useRef<HTMLDivElement>(null)

  const [xPosition, setXPosition] = useState<number>(0)
  const [menuWidth, setMenuWidth] = useState<number>(0)

  useEffect(() => {
    if (menuRef.current) {
      const { x } = menuRef.current.getBoundingClientRect()
      setXPosition(x)
      setMenuWidth(menuRef.current?.clientWidth)
    }
  }, [])

  const getDirection = () => {
    if (xPosition - menuWidth < 0) {
      return "left-0 origin-top-left"
    } else {
      return "right-0 origin-top-right"
    }
  }

  return (
    <motion.div
      id="menu"
      ref={menuRef}
      {...menuAnimation}
      className={`absolute top-5 z-20 w-max bg-zinc-900/95 py-4 text-lg shadow-md shadow-black ${getDirection()}`}
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
    <span
      className={`relative block h-1 w-1 bg-slate-100 before:absolute before:-top-2 before:left-0 before:h-1 before:w-1 before:bg-slate-100 before:transition-all after:absolute after:left-0 after:top-2 after:h-1 after:w-1 after:bg-slate-100 after:transition-all ${
        isMenuOpened && "before:translate-y-2 after:-translate-y-2"
      } `}
    />
  )
}

export default MenuWrapper
