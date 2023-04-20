import { useState } from "react"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import PlusIcon from "./PlusIcon"
import useEdit from "../hooks/useEdit"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"

function List() {
  const { isEditing, edit, cancelEdit } = useEdit()
  return (
    <section className="mt-4 flex min-w-[18rem] flex-col gap-4 border border-neutral-800 bg-zinc-800 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-blue-500" />
        {!isEditing ? (
          <>
            <h2 className="text-xl">to do</h2>
            <button className="group py-2">
              <PlusIcon />
            </button>
          </>
        ) : (
          <form className="flex w-48 items-center gap-1">
            <input type="text" className="w-full bg-zinc-900" />
            <button className="transition-transform hover:scale-110">
              <AiOutlineCheck />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="transition-transform hover:scale-110"
            >
              <AiOutlineClose />
            </button>
          </form>
        )}
        <div className="ml-auto pr-2">
          <MenuButton>
            <>
              <MenuItem>add task</MenuItem>
              <MenuItem handleClick={edit}>edit list name</MenuItem>
              <MenuItem>change color</MenuItem>
              <MenuItem>delete list</MenuItem>
            </>
          </MenuButton>
        </div>
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
    </section>
  )
}

function Task() {
  const { isEditing, edit, cancelEdit } = useEdit()

  return (
    <div className="flex items-center justify-between border border-neutral-800 bg-zinc-700 p-2">
      {!isEditing ? (
        <p>task 1</p>
      ) : (
        <form className="flex w-48 items-center gap-1">
          <input type="text" className="w-full bg-zinc-900" />
          <button className="transition-transform hover:scale-110">
            <AiOutlineCheck />
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="transition-transform hover:scale-110"
          >
            <AiOutlineClose />
          </button>
        </form>
      )}
      <MenuButton>
        <>
          <MenuItem handleClick={edit}>edit task name</MenuItem>
          <MenuItem>assign user</MenuItem>
          <MenuItem>delete task</MenuItem>
        </>
      </MenuButton>
    </div>
  )
}

export default List
