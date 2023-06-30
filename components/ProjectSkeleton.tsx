function ProjectSkeleton({ width }: { width: number }) {
  return (
    <section className="my-4 animate-pulse border-b border-neutral-700">
      <div className="flex items-center gap-4">
        <div className={`h-8 bg-zinc-700`} style={{ width }} />
        <div className={`h-8 w-4 bg-zinc-700`} />
        <div className={`ml-auto h-6 w-6 cursor-grab bg-zinc-700`} />
      </div>
      <ul className="flex flex-col gap-2 py-4 lg:gap-4">
        <BoardSkeleton width={60} />
        <BoardSkeleton width={200} />
        <BoardSkeleton width={120} />
        <BoardSkeleton width={80} />
      </ul>
    </section>
  )
}

function BoardSkeleton({ width }: { width: number }) {
  return (
    <div
      className={`group flex cursor-pointer items-center gap-2 px-2 text-xl`}
    >
      <div className="h-4 w-4 bg-zinc-700" />
      <div className="h-7 bg-zinc-700" style={{ width }} />
      <div className={`invisible z-10 scale-0 transition-transform`}></div>
    </div>
  )
}

export default ProjectSkeleton
