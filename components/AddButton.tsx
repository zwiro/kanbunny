import { useState } from "react"

interface AddButtonProps {
  children: JSX.Element
  handleClick?: () => void
}

function AddButton({ children, handleClick }: AddButtonProps) {
  return (
    <button
      onClick={handleClick}
      className="group mx-auto mt-4 flex min-w-fit items-center gap-2 self-start  border border-neutral-800 bg-zinc-900 px-4 py-5 text-lg font-bold transition-colors hover:bg-zinc-950 lg:mx-0"
    >
      {children}
    </button>
  )
}

export default AddButton
