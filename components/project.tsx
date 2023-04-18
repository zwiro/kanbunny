import PlusIcon from "./plusIcon"

function Board() {
  return (
    <li className="flex items-center gap-2 text-xl">
      <div className="h-4 w-4 rounded-full bg-red-500" />
      <li>board 1</li>
    </li>
  )
}

function Project() {
  return (
    <section className="my-4">
      <div className="flex items-center gap-4">
        <p>project 1</p>
        <button className="group">
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

export default Project
