import type { Color } from "@prisma/client"

interface ColorDotProps {
  editColor?: () => void
  color: Color
  children?: React.ReactNode
}

function ColorDot({ editColor, color, children }: ColorDotProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        editColor?.()
      }}
      className={`peer relative h-4 w-4 cursor-pointer bg-${color}-500`}
    >
      {children}
    </button>
  )
}

export default ColorDot
