function ProjectSkeleton() {
  return (
    <section className="my-4 animate-pulse border-b border-neutral-700">
      <div className="flex items-center gap-4">
        <div className={`relative h-8 w-28 bg-zinc-700`} />
        <div className={`h-8 w-4 bg-zinc-700`} />
        <div className={`ml-auto h-6 w-6 cursor-grab bg-zinc-700`} />
      </div>
      <ul className="flex flex-col gap-2 py-4 lg:gap-4">
        <BoardSkeleton />
        <BoardSkeleton />
        <BoardSkeleton />
        <BoardSkeleton />
      </ul>
    </section>
  )
}

function BoardSkeleton() {
  const getRandomWidth = () => {
    const min = 64
    const max = 128
    const randomWidth = Math.floor(Math.random() * (max - min + 1)) + min
    return randomWidth
  }
  return (
    <li className={`group flex cursor-pointer items-center gap-2 px-2 text-xl`}>
      <div className="h-4 w-4 bg-zinc-700" />
      <div
        className="h-7 bg-zinc-700"
        style={{ width: `${getRandomWidth()}px` }}
      />
      <div className={`invisible z-10 scale-0 transition-transform`}></div>
    </li>
  )
}

export default ProjectSkeleton
