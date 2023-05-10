import useClickOutside from "@/hooks/useClickOutside"
import { useRef } from "react"
import { motion } from "framer-motion"
import { z } from "zod"
import { trpc } from "@/utils/trpc"

interface ColorPickerProps {
  close: () => void
  id: string
  projectId: string
}

export const colorSchema = z.object({
  color: z.enum(["red", "blue", "green", "yellow", "pink"]),
  id: z.string(),
  projectId: z.string(),
})

function ColorPicker({ close, id, projectId }: ColorPickerProps) {
  const pickerRef = useRef(null)
  useClickOutside([pickerRef], close)

  const pickerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const utils = trpc.useContext()

  const editColor = trpc.board.editColor.useMutation({
    onSuccess: () => {
      close()
      utils.project.user.invalidate()
    },
  })

  return (
    <motion.div
      {...pickerAnimation}
      ref={pickerRef}
      className="absolute -left-2 -top-2 flex gap-2 bg-zinc-900 p-2"
    >
      <div
        onClick={() => editColor.mutate({ id, projectId, color: "red" })}
        className="relative h-4 w-4 rounded-full bg-red-500 hover:brightness-125"
      />
      <div
        onClick={() => editColor.mutate({ id, projectId, color: "blue" })}
        className="relative h-4 w-4 rounded-full bg-blue-500 hover:brightness-125"
      />
      <div
        onClick={() => editColor.mutate({ id, projectId, color: "green" })}
        className="relative h-4 w-4 rounded-full bg-green-500 hover:brightness-125"
      />
      <div
        onClick={() => editColor.mutate({ id, projectId, color: "yellow" })}
        className="relative h-4 w-4 rounded-full bg-yellow-500 hover:brightness-125"
      />
      <div
        onClick={() => editColor.mutate({ id, projectId, color: "pink" })}
        className="relative h-4 w-4 rounded-full bg-pink-500 hover:brightness-125"
      />
    </motion.div>
  )
}

export default ColorPicker
