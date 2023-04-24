import useClickOutside from "@/hooks/useClickOutside"
import { useRef } from "react"
import { motion } from "framer-motion"

interface ColorPickerProps {
  cancel?: () => void
}

function ColorPicker({ cancel }: ColorPickerProps) {
  const pickerRef = useRef(null)
  useClickOutside([pickerRef], cancel)

  const pickerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <motion.div
      {...pickerAnimation}
      ref={pickerRef}
      className="absolute -left-2 -top-2 flex gap-2 bg-zinc-900 p-2"
    >
      <div className="relative h-4 w-4 rounded-full bg-red-500" />
      <div className="relative h-4 w-4 rounded-full bg-blue-500" />
      <div className="relative h-4 w-4 rounded-full bg-green-500" />
      <div className="relative h-4 w-4 rounded-full bg-yellow-500" />
      <div className="relative h-4 w-4 rounded-full bg-pink-500" />
    </motion.div>
  )
}

export default ColorPicker
