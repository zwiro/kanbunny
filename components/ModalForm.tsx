import { motion } from "framer-motion"

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
}

function ModalForm({ children }: ModalFormProps) {
  return (
    <motion.div
      variants={modalVariant}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed left-0 top-0 z-30 grid h-screen w-screen place-items-center bg-zinc-900/90"
    >
      <form className="grid h-full w-3/4 place-items-center">
        <motion.div
          variants={formVariant}
          className="bg-zinc-800 p-12 [&>div:first-child]:border-b-0 [&>div:nth-last-child(2)]:border-t-0"
        >
          {children}
        </motion.div>
      </form>
    </motion.div>
  )
}

export default ModalForm
