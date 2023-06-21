import { motion } from "framer-motion"

interface ConfirmPopupProps {
  name: string
  type: "project" | "board" | "list"
  action?: "delete" | "leave"
  handleClick: () => void
  close: () => void
}

function ConfirmPopup({
  name,
  type,
  action = "delete",
  handleClick,
  close,
}: ConfirmPopupProps) {
  const confirmPopupAnimation = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  }

  return (
    <motion.div
      {...confirmPopupAnimation}
      role="alert"
      className="absolute inset-0 z-50 grid cursor-default place-content-center text-center text-lg"
    >
      <div className="space-y-8 border border-neutral-700 bg-zinc-900 p-8">
        <p>
          you are going to {action} <strong>{name}</strong> {type}
        </p>
        <p>do you confirm?</p>
        <div className="flex justify-between">
          <button
            onClick={handleClick}
            className="border border-neutral-800 bg-zinc-950 px-4 py-2 hover:bg-zinc-800"
          >
            confirm
          </button>
          <button
            onClick={close}
            className="border border-neutral-800 bg-zinc-950 px-4 py-2 hover:bg-zinc-800"
          >
            cancel
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default ConfirmPopup
