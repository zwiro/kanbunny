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
    <li
      onClick={() => {
        handleClick && handleClick()
        closeOnClickInside && closeMenu()
      }}
      className="px-8 hover:cursor-pointer hover:bg-zinc-800"
    >
      {children}
    </li>
  )
}

export default MenuItem
