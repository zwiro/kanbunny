import { useState } from "react"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import useEdit from "../hooks/useEdit"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import AddEditForm from "./AddEditForm"
import ListContainer from "./ListContainer"
import AddTaskModal from "./AddTaskModal"
import useAdd from "@/hooks/useAdd"
import { AnimatePresence, motion } from "framer-motion"
import useClickOutside from "@/hooks/useClickOutside"
import { useRef } from "react"
import ColorPicker from "./ColorPicker"
import UserCheckbox from "./UserCheckbox"

function List() {
  const { isEditing, edit, cancelEdit } = useEdit()
  const {
    isEditing: isEditingColor,
    edit: editColor,
    cancelEdit: cancelEditColor,
  } = useEdit()
  const { isAdding, add, cancelAdd } = useAdd()

  return (
    <section className="mt-4 flex h-min min-w-[18rem] flex-col gap-4 border border-neutral-800 bg-zinc-800 p-4">
      <div className="flex items-center gap-2">
        <div
          onClick={editColor}
          className="relative h-4 w-4 rounded-full bg-blue-500"
        >
          <AnimatePresence>
            {isEditingColor && <ColorPicker cancel={cancelEditColor} />}
          </AnimatePresence>
        </div>
        {!isEditing ? (
          <>
            <h2 className="text-xl">to do</h2>
            <button
              onClick={add}
              className={`group py-2 ${isEditingColor && "scale-0"} `}
            >
              <PlusIcon />
            </button>
            <div className="ml-auto pr-2">
              <MenuButton>
                <MenuItem handleClick={add}>add task</MenuItem>
                <MenuItem handleClick={edit}>edit list name</MenuItem>
                <MenuItem handleClick={editColor}>change color</MenuItem>
                <MenuItem>delete list</MenuItem>
              </MenuButton>
            </div>
          </>
        ) : (
          <AddEditForm
            name="list-name"
            placeholder="list name"
            cancel={cancelEdit}
          />
        )}
      </div>
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <Task />
      <AnimatePresence>
        {isAdding && <AddTaskModal cancel={cancelAdd} />}
      </AnimatePresence>
    </section>
  )
}

function Task() {
  const { isEditing, edit, cancelEdit } = useEdit()
  const {
    isEditing: isEditingUsers,
    edit: editUsers,
    cancelEdit: cancelEditUsers,
  } = useEdit()

  const taskAnimation = {
    initial: { height: 0, opacity: 0, padding: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0, padding: 0 },
  }

  return (
    <>
      <div className="group flex items-center justify-between border border-neutral-700 bg-zinc-700 p-2">
        {!isEditing ? (
          <>
            <p>task 1</p>
            <div className="scale-0 transition-transform group-hover:scale-100">
              <MenuButton>
                <MenuItem handleClick={edit}>edit task name</MenuItem>
                <MenuItem handleClick={editUsers}>assign user</MenuItem>
                <MenuItem>delete task</MenuItem>
              </MenuButton>
            </div>
          </>
        ) : (
          <div className="[&>form>input]:py-1.5 [&>form>input]:text-base">
            <AddEditForm
              name="task name"
              placeholder="task name"
              cancel={cancelEdit}
            />
          </div>
        )}
      </div>
      <AnimatePresence>
        {isEditingUsers && (
          <motion.div {...taskAnimation}>
            <div className="flex flex-wrap gap-2">
              <UserCheckbox name="janek" />
              <UserCheckbox name="john" />
              <UserCheckbox name="bobby" />
              <UserCheckbox name="adam" />
              <UserCheckbox name="jimmy" />
              <UserCheckbox name="daniel" />
            </div>
            <div className="flex items-center gap-1">
              <button className="ml-auto transition-transform hover:scale-110">
                <AiOutlineCheck size={20} />
              </button>
              <button
                type="button"
                onClick={cancelEditUsers}
                className="transition-transform hover:scale-110"
              >
                <AiOutlineClose size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default List
