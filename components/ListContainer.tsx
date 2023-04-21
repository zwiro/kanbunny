interface ListContainerProps {
  children: JSX.Element
}

function ListContainer({ children }: ListContainerProps) {
  return (
    <section className="mt-4 flex h-min min-w-[18rem] flex-col gap-4 border border-neutral-800 bg-zinc-800 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-blue-500" />
        {children}
      </div>
    </section>
  )
}

export default ListContainer
