import { useState } from "react"

interface AddButtonProps {
  children: JSX.Element | [string, JSX.Element]
  handleClick?: () => void
  isLoading?: boolean
}

function AddButton({ children, handleClick, isLoading }: AddButtonProps) {
  return (
    <button
      // type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="group mx-auto mt-4 flex min-w-fit items-center gap-2 self-start bg-zinc-900 px-4 py-5 text-lg font-bold transition-colors hover:bg-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-400 lg:mx-0"
    >
      {children}
    </button>
  )
}

export default AddButton
