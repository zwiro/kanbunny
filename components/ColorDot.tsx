import { AnimatePresence } from "framer-motion"
import ColorPicker from "./ColorPicker"
import { Color } from "@prisma/client"

interface ColorDotProps {
  editColor?: () => void
  color: Color
  children?: React.ReactNode
}

function ColorDot({ editColor, color, children }: ColorDotProps) {
  return (
    <div
      onClick={editColor}
      className={`relative h-4 w-4 cursor-pointer rounded-full bg-${color}-500`}
    >
      {children}
    </div>
  )
}

export default ColorDot
