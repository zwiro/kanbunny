import { motion } from "framer-motion"
import { useState } from "react"

interface MenuProps {
  children: JSX.Element
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
      className={`absolute top-5 z-10 w-max origin-top-left bg-zinc-900/95 py-4 text-lg ${
        direction === "right"
          ? "left-0 origin-top-left"
          : "right-0 origin-top-right"
      } `}
    >
      <ul className="flex flex-col gap-2">{children}</ul>
    </motion.div>
  )
}

export default Menu
