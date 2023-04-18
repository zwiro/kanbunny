import PlusIcon from "./plusIcon"
import Project from "./project"
import { AiOutlineArrowRight } from "react-icons/ai"
import { useState } from "react"
import AddButton from "./addButton"

function SideMenu() {
  return (
    <aside className="fixed bottom-0 left-0 top-16 border-r border-t border-neutral-800 bg-zinc-800 p-8 text-2xl">
      <Project />
      <Project />
      <Project />
      <AddButton>
        <>
          new project <PlusIcon />
        </>
      </AddButton>
    </aside>
  )
}

export default SideMenu
