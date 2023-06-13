function ListSkeleton() {
  return (
    <section
      className={`mt-4 flex min-w-[18rem] flex-col gap-4 border-t-4 border-t-green-500 bg-zinc-800 p-4`}
    >
      <div className="flex h-9 items-center gap-2">
        <div className="h-4 w-4 animate-pulse bg-zinc-700" />
        <div className="h-7 w-24 animate-pulse bg-zinc-700 text-xl" />
        <div className={`h-4 w-[18px] animate-pulse bg-zinc-700`} />
        <div className={`ml-auto mr-2 h-9 w-3 animate-pulse bg-zinc-700`} />
        <div className={`h-6 w-6 animate-pulse cursor-grab bg-zinc-700`} />
      </div>
      <TaskSkeleton />
      <TaskSkeleton />
      <TaskSkeleton />
      <TaskSkeleton />
    </section>
  )
}

function TaskSkeleton() {
  return (
    <div
      className={`group flex h-[52px] animate-pulse items-center justify-between border-l-8 border-l-blue-500 bg-zinc-700 p-2`}
    >
      <div className="relative flex flex-col">
        <div className="flex h-6 w-32 items-center gap-2 bg-zinc-600" />
      </div>
    </div>
  )
}

export default ListSkeleton
