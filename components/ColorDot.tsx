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
      className={`peer relative h-4 w-4 flex-shrink-0 cursor-pointer bg-${color}-500`}
      aria-label="Edit color"
    >
      {children}
    </button>
  )
}

export default ColorDot
