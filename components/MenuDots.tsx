interface MenuDotsProps {
  isMenuOpened: boolean
}

function MenuDots({ isMenuOpened }: MenuDotsProps) {
  return (
    <div
      className={`relative h-1 w-1 bg-slate-100 before:absolute before:-top-2 before:left-0 before:h-1 before:w-1 before:bg-slate-100 before:transition-all after:absolute after:left-0 after:top-2 after:h-1 after:w-1 after:bg-slate-100 after:transition-all ${
        isMenuOpened && "before:translate-y-2 after:-translate-y-2"
      } `}
    />
  )
}

export default MenuDots
