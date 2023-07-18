import type { Color } from "@prisma/client"

interface ColorDotProps {
  children?: React.ReactNode
}

function ColorDot({ children }: ColorDotProps) {
  return (
    <div className="peer relative flex h-4 w-4 flex-shrink-0">{children}</div>
  )
}

interface ColorDotButtonProps {
  editColor?: () => void
  color: Color
}

export function ColorDotButton({ editColor, color }: ColorDotButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        editColor?.()
      }}
      className={`h-full w-full bg-${color}-500`}
      aria-label="Edit color"
    />
  )
}

export default ColorDot
