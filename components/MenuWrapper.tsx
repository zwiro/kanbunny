import { useRef, useContext } from "react"
import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"
import useClickOutside from "@/hooks/useClickOutside"
import MenuContext, { MenuProvider } from "@/context/MenuContext"

interface MenuWrapperProps {
  children: React.ReactNode
  direction?: "left" | "right"
  isLoading?: boolean
}

function MenuWrapper({
  children,
  direction = "left",
  isLoading = false,
}: MenuWrapperProps) {
  return (
    <MenuProvider>
      <MenuButton direction={direction} isLoading={isLoading}>
        {children}
      </MenuButton>
    </MenuProvider>
  )
}

interface MenuButtonProps {
  children: React.ReactNode
  direction: "left" | "right"
  isLoading?: boolean
}

function MenuButton({
  children,
  direction,
  isLoading = false,
}: MenuButtonProps) {
  const { isMenuOpened, closeMenu, openMenu } = useContext(MenuContext)

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
      >
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
  children: React.ReactNode
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

export default MenuWrapper
