import { useState } from "react"

interface AddButtonProps {
  children: JSX.Element
}

function AddButton({ children }: AddButtonProps) {
  return (
    <button className="group mx-auto mt-4 flex items-center gap-2 border border-neutral-800 bg-zinc-900 p-4 text-lg font-bold transition-colors hover:bg-zinc-950">
      {children}
    </button>
  )
}

export default AddButton
