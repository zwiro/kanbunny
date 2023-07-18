import { useRef } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import useClickOutside from "@/hooks/useClickOutside"
import useCloseOnEscape from "@/hooks/useCloseOnEscape"

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
  const popupRef = useRef<HTMLDivElement>(null)
  useClickOutside([popupRef], close)

  useCloseOnEscape(close)

  const confirmPopupAnimation = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  }

  return createPortal(
    <motion.div
      {...confirmPopupAnimation}
      role="alert"
      className="fixed inset-0 z-10 mx-2 grid cursor-default place-items-center text-center"
    >
      <div
        ref={popupRef}
        className="inset-0 m-auto space-y-8 bg-zinc-900 p-8 text-center text-lg shadow-md shadow-black"
      >
        <p>
          you are going to {action} <strong>{name}</strong> {type}
        </p>
        <p>do you confirm?</p>
        <div className="flex justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
            className="border border-neutral-700 bg-zinc-900 px-4 py-2 hover:bg-zinc-950 focus:bg-zinc-950"
          >
            confirm
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              close()
            }}
            className="border border-neutral-700 bg-zinc-900 px-4 py-2 hover:bg-zinc-950 focus:bg-zinc-950"
          >
            cancel
          </button>
        </div>
      </div>
    </motion.div>,
    document.querySelector("#layout")!
  )
}

export default ConfirmPopup
