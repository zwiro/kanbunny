import MenuDots from "./menuDots"
import PlusIcon from "./plusIcon"

function Task() {
  return (
    <div className="flex items-center justify-between border border-neutral-800 bg-zinc-700 p-2">
      <p>task 1</p>
      <MenuDots />
    </div>
  )
}

function List() {
  return (
    <section className="mt-4 flex flex-col gap-4 border border-neutral-800 bg-zinc-800 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-blue-500" />
        <h2 className="text-xl">to do</h2>
        <button className="group py-2">
          <PlusIcon />
        </button>
        <div className="ml-auto pr-2">
          <MenuDots />
        </div>
      </div>
      <Task />
      <Task />
      <Task />
    </section>
  )
}

export default List
