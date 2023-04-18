import PlusIcon from "./plusIcon"
import Project from "./project"
import { AiOutlineArrowRight } from "react-icons/ai"
import { useState } from "react"
import AddButton from "./addButton"
import { motion } from "framer-motion"

function SideMenu() {
  const sideMenuAnimation = {
    initial: { x: "-100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
    transition: { type: "tween" },
  }

  return (
    <motion.aside
      {...sideMenuAnimation}
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-0 left-0 top-16 border-r border-t border-neutral-800 bg-zinc-800 p-8 text-2xl"
    >
      <Project />
      <Project />
      <Project />
      <AddButton>
        <>
          new project <PlusIcon />
        </>
      </AddButton>
    </motion.aside>
  )
}

export default SideMenu
