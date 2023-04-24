import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import useEdit from "@/hooks/useEdit"
import AddEditForm from "./AddEditForm"
import useAdd from "@/hooks/useAdd"
import AddProjectModal from "./AddProjectModal"
import useClickOutside from "@/hooks/useClickOutside"
import { useContext, useRef, useState } from "react"
import LayoutContext from "@/context/LayoutContext"
import ColorPicker from "./ColorPicker"

function SideMenu() {
  const { isAdding, add, cancelAdd } = useAdd()
  const sideMenuAnimation = {
    initial: { x: "-100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
    transition: { type: "tween" },
  }

  return (
    <>
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-16 w-11/12 overflow-y-scroll bg-zinc-800 px-24 py-8 text-2xl lg:px-36 lg:text-3xl [&>button]:my-0"
      >
        <AddButton handleClick={add}>
          <>
            new project <PlusIcon />
          </>
        </AddButton>
        <Project />
        <Project />
        <Project />
        <Project />
        <Project />
      </motion.aside>
      <AnimatePresence>
        {isAdding && <AddProjectModal cancel={cancelAdd} />}
      </AnimatePresence>
    </>
  )
}

function Project() {
  const { isEditing, edit, cancelEdit } = useEdit()
  const { isAdding, add, cancelAdd } = useAdd()

  return (
    <section className="my-4 border-b border-neutral-700">
      {!isEditing ? (
        <div className="flex items-center gap-4">
          <p>project 1</p>
          <MenuButton>
            <MenuItem handleClick={add}>add board</MenuItem>
            <MenuItem>add user</MenuItem>
            <MenuItem handleClick={edit}>edit project name</MenuItem>
            <MenuItem>delete project</MenuItem>
          </MenuButton>
        </div>
      ) : (
        <div className="pt-1.5">
          <AddEditForm
            name="project-name"
            placeholder="project name"
            cancel={cancelEdit}
          />
        </div>
      )}
      <ul className="flex flex-col gap-2 py-4 lg:gap-4">
        {isAdding && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500" />
            <AddEditForm
              name="board-name"
              placeholder="board name"
              cancel={cancelAdd}
            />
          </div>
        )}
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
  const { isEditing, edit, cancelEdit } = useEdit()
  const {
    isEditing: isEditingColor,
    edit: editColor,
    cancelEdit: cancelEditColor,
  } = useEdit()
  return (
    <li onClick={editColor} className="group flex items-center gap-2 text-xl">
      <div className="relative h-4 w-4 rounded-full bg-red-500">
        {isEditingColor && <ColorPicker />}
      </div>
      {!isEditing ? (
        <>
          <p>board 1</p>

          <div className="scale-0 transition-transform group-hover:scale-100">
            <MenuButton>
              <MenuItem handleClick={edit}>edit board name</MenuItem>
              <MenuItem handleClick={editColor}>change color</MenuItem>
              <MenuItem>delete board</MenuItem>
            </MenuButton>
          </div>
        </>
      ) : (
        <div className="">
          <AddEditForm
            name="board-name"
            placeholder="board name"
            cancel={cancelEdit}
          />
        </div>
      )}
    </li>
  )
}

export default SideMenu
