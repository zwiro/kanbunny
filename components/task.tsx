import MenuDots from "./menuDots"

function Task() {
  return (
    <div className="flex items-center justify-between border border-neutral-800 bg-zinc-700 p-2">
      <p>task 1</p>
      <MenuDots />
    </div>
  )
}

export default Task
