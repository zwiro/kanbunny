interface ListContainerProps {
  children: React.ReactNode
}

function ListContainer({ children }: ListContainerProps) {
  return (
    <section className="mt-4 flex h-min min-w-[18rem] flex-col gap-4 border border-t-4 border-neutral-700 border-t-blue-500 bg-zinc-800 p-4 pb-7">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-blue-500" />
        {children}
      </div>
    </section>
  )
}

export default ListContainer
