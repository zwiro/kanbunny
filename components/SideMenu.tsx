import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
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

function Project() {
  return (
    <section className="my-4">
      <div className="flex items-center gap-4">
        <p>project 1</p>
        <button className="group py-2">
          <PlusIcon />
        </button>
      </div>
      <ul className="flex flex-col gap-2 py-4">
        <Board />
        <Board />
        <Board />
        <Board />
      </ul>
    </section>
  )
}

function Board() {
  return (
    <li className="flex items-center gap-2 text-xl">
      <div className="h-4 w-4 rounded-full bg-red-500" />
      <li>board 1</li>
    </li>
  )
}

export default SideMenu
