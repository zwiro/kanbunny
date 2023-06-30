import MenuContext from "@/context/MenuContext"
import { useContext } from "react"

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

  return (
    <li className="hover:cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
      <button
        className="w-full px-8 text-left"
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
