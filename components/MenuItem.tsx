interface MenuItemProps {
  children: string
  handleClick?: () => void
}

function MenuItem({ children, handleClick }: MenuItemProps) {
  return (
    <li
      onClick={(e) => {
        handleClick && handleClick()
        e.stopPropagation()
      }}
      className="px-8 hover:cursor-pointer hover:bg-zinc-800"
    >
      {children}
    </li>
  )
}

export default MenuItem
