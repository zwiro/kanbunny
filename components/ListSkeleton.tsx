function ListSkeleton({ width }: { width: number }) {
  return (
    <section
      className={`mt-4 flex min-w-[18rem] animate-pulse flex-col gap-4 border-b border-l border-r border-t-4 border-b-neutral-700 border-l-neutral-700 border-r-neutral-700 border-t-green-500 bg-zinc-800 p-4`}
    >
      <div className="flex h-9 items-center gap-2">
        <div className="h-4 w-4 bg-zinc-700" />
        <div className="h-7 bg-zinc-700 text-xl" style={{ width }} />
        <div className={`h-4 w-[18px] bg-zinc-700`} />
        <div className={`ml-auto mr-2 h-9 w-3 bg-zinc-700`} />
        <div className={`h-6 w-6 cursor-grab bg-zinc-700`} />
      </div>
      <TaskSkeleton width={60} />
      <TaskSkeleton width={160} />
      <TaskSkeleton width={120} />
      <TaskSkeleton width={90} />
    </section>
  )
}

function TaskSkeleton({ width }: { width: number }) {
  return (
    <div
      className={`group flex h-[52px] items-center justify-between border-b border-l-8 border-r border-t border-b-neutral-800 border-l-blue-500 border-r-neutral-800 border-t-neutral-800 bg-zinc-700 p-2`}
    >
      <div className="relative flex flex-col">
        <div
          className="flex h-6 items-center gap-2 bg-zinc-600"
          style={{ width }}
        />
      </div>
    </div>
  )
}

export default ListSkeleton
