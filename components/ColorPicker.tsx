import useClickOutside from "@/hooks/useClickOutside"
import { useRef } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { UseTRPCMutationResult } from "@trpc/react-query/shared"
import type { Board, List, Task } from "@prisma/client"
import { colorSchema } from "@/utils/schemas"

type ColorSchema = z.infer<typeof colorSchema>

interface ColorPickerProps {
  close: () => void
  id: string
  editColor: UseTRPCMutationResult<Board | List | Task, any, any, any>
  currentColor: ColorSchema["color"]
}

function ColorPicker({ close, id, editColor, currentColor }: ColorPickerProps) {
  const pickerRef = useRef(null)
  useClickOutside([pickerRef], close)

  const pickColor = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target instanceof HTMLButtonElement) {
      const color = e.target.dataset.color as ColorSchema["color"]
      if (color !== currentColor) {
        editColor.mutateAsync({ id, color })
      } else {
      }
    }
    close()
  }

  const pickerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const colorVariants = {
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    pink: "bg-pink-500",
  }

  return (
    <motion.div
      {...pickerAnimation}
      ref={pickerRef}
      className="absolute -left-2 -top-2 flex gap-2 bg-zinc-900 p-2"
      onClick={pickColor}
    >
      {Object.values(colorSchema.shape.color.enum).map((color) => (
        <button
          key={color}
          className={`relative h-4 w-4 ${colorVariants[color]} ${
            color === currentColor
              ? "ring-2 ring-inset ring-zinc-900 "
              : "hover:brightness-125"
          } `}
          data-color={color}
        />
      ))}
    </motion.div>
  )
}

export default ColorPicker
