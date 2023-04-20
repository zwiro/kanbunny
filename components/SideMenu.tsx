import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { motion } from "framer-motion"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import useEdit from "@/hooks/useEdit"
import EditForm from "./EditForm"

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
      className="fixed bottom-0 left-0 top-16 overflow-y-scroll border-r border-t border-neutral-800 bg-zinc-800 px-16 py-8 text-2xl lg:px-24 lg:text-3xl"
    >
      <Project />
      <Project />
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
  const { isEditing, edit, cancelEdit } = useEdit()
  return (
    <section className="my-4 border-b border-neutral-700">
      <div className="flex items-center justify-between">
        {!isEditing ? <p>project 1</p> : <EditForm cancelEdit={cancelEdit} />}
        <MenuButton>
          <>
            <MenuItem>add board</MenuItem>
            <MenuItem>add user</MenuItem>
            <MenuItem handleClick={edit}>edit project name</MenuItem>
            <MenuItem>delete project</MenuItem>
          </>
        </MenuButton>
      </div>
      <ul className="flex flex-col gap-2 py-4 lg:gap-4">
        <Board />
        <Board />
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
      <p>board 1</p>
    </li>
  )
}

export default SideMenu
