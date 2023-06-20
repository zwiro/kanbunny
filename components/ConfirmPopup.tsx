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
  return (
    <div
      role="alert"
      className="absolute inset-0 z-50 m-auto grid h-52 w-96 place-content-center gap-8 bg-zinc-900 text-center text-lg"
    >
      <p>
        you are going to {action} <strong>{name}</strong> {type}
      </p>
      <p>do you confirm?</p>
      <div className="flex justify-between">
        <button
          onClick={handleClick}
          className="bg-zinc-950 px-4 py-2 hover:bg-zinc-800"
        >
          confirm
        </button>
        <button
          onClick={close}
          className="bg-zinc-950 px-4 py-2 hover:bg-zinc-800"
        >
          cancel
        </button>
      </div>
    </div>
  )
}

export default ConfirmPopup
