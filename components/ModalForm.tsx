import useClickOutside from "@/hooks/useClickOutside"
import { motion } from "framer-motion"
import { useRef } from "react"

const modalVariant = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
}

const formVariant = {
  hidden: {
    scale: 0,
  },
  visible: {
    scale: 1,
  },
}

interface ModalFormProps {
  children: JSX.Element | JSX.Element[]
  close?: () => void
  handleSubmit?: (data: any) => void
}

function ModalForm({ children, close, handleSubmit }: ModalFormProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useClickOutside([modalRef], close)

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      variants={modalVariant}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed left-0 top-0 z-30 grid h-screen w-screen place-items-center bg-zinc-900/90"
    >
      <form
        onSubmit={handleSubmit}
        className="grid h-full w-3/4 place-items-center"
      >
        <motion.div
          ref={modalRef}
          variants={formVariant}
          className="w-full bg-zinc-800 p-12 [&>div.field:last-of-type]:border-t-0 [&>div.field:nth-of-type(2)]:border-t-0"
        >
          {children}
        </motion.div>
      </form>
    </motion.div>
  )
}

export default ModalForm
