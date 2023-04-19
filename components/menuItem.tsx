interface MenuItemProps {
  children: string
}

function MenuItem({ children }: MenuItemProps) {
  return (
    <li className="px-8 hover:cursor-pointer hover:bg-zinc-800">{children}</li>
  )
}

export default MenuItem
