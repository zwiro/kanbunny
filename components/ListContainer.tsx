interface ListContainerProps {
  children: React.ReactNode
  length: number
}

function ListContainer({ children, length }: ListContainerProps) {
  return (
    <section
      className={`mt-4 flex h-min min-w-[18rem] flex-col gap-4 border border-t-4 border-neutral-700 border-t-blue-500 bg-zinc-800 p-4 pb-7 ${
        length && "ml-4 lg:ml-8 xl:ml-16"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-blue-500" />
        {children}
      </div>
    </section>
  )
}

export default ListContainer
