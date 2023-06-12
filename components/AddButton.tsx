import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react"

interface AddButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: React.ReactNode
  handleClick?: () => void
  isLoading?: boolean
}

function AddButton({ children, ...props }: AddButtonProps) {
  return (
    <button
      {...props}
      className="group mx-auto mt-4 flex min-w-fit items-center gap-2 self-start bg-zinc-900 px-4 py-5 text-lg font-bold transition-colors hover:bg-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-400 lg:mx-0"
    >
      {children}
    </button>
  )
}

export default AddButton
