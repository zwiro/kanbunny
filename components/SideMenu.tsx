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
import TextInput from "./TextInput"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import useInviteUser from "@/hooks/useInviteUser"

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
  const {
    isEditing: isEditingUsers,
    edit: editUsers,
    cancelEdit: cancelEditUsers,
  } = useEdit()

  const { isAdding, add, cancelAdd } = useAdd()

  const { user, invitedUsers, inviteUser, removeUser, handleChange } =
    useInviteUser()

  const projectUsersAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  }

  return (
    <section className="my-4 border-b border-neutral-700">
      {!isEditing ? (
        <div className="flex items-center gap-4">
          <p>project 1</p>
          <MenuButton>
            <MenuItem handleClick={add}>add board</MenuItem>
            <MenuItem handleClick={editUsers}>add user</MenuItem>
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
      <AnimatePresence>
        {isEditingUsers && (
          <motion.div
            {...projectUsersAnimation}
            className="flex flex-col gap-2 pt-4 text-base"
          >
            <form className="flex items-center gap-2">
              <TextInput
                name="users"
                placeholder="johndoe21"
                handleChange={handleChange}
                value={user}
              />
              <button onClick={inviteUser} className="group">
                <PlusIcon />
              </button>
            </form>
            <p>invited ({invitedUsers.length})</p>
            <ul className="flex flex-wrap gap-2">
              {invitedUsers.map((user, i) => (
                <li
                  key={`${user}-${i}`}
                  onClick={() => removeUser(user)}
                  className="border border-zinc-900 p-2"
                >
                  {user}
                </li>
              ))}
            </ul>
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
    <li className="group flex items-center gap-2 text-xl">
      <div
        onClick={editColor}
        className="relative z-0 h-4 w-4 rounded-full bg-red-500"
      >
        {isEditingColor && <ColorPicker cancel={cancelEditColor} />}
      </div>
      {!isEditing ? (
        <>
          <p>board 1</p>
          <div
            className={`z-20 scale-0 transition-transform group-hover:scale-100 ${
              isEditingColor && "scale-0 group-hover:scale-0"
            } `}
          >
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
