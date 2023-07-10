import MenuContext from "@/context/MenuContext"
import { useContext, useId } from "react"

interface MenuItemProps {
  children: string
  handleClick?: () => void
  closeOnClickInside?: boolean
}

function MenuItem({
  children,
  handleClick,
  closeOnClickInside = true,
}: MenuItemProps) {
  const { closeMenu } = useContext(MenuContext)

  const id = useId()

  return (
    <li>
      <button
        id={id}
        className="w-full px-8 text-left text-sm hover:cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 md:text-lg"
        onClick={() => {
          handleClick && handleClick()
          closeOnClickInside && closeMenu()
        }}
      >
        {children}
      </button>
    </li>
  )
}

export default MenuItem
