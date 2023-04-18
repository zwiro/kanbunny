import MenuDots from "./menuDots"
import PlusIcon from "./plusIcon"
import Task from "./task"

function List() {
  return (
    <div className="mt-4 flex flex-col gap-4 bg-zinc-800 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl">to do</h2>
        <PlusIcon />
      </div>
      <Task />
      <Task />
      <Task />
    </div>
  )
}

export default List
