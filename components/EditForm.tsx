import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"

interface EditFormProps {
  cancelEdit: () => void
}

function EditForm({ cancelEdit }: EditFormProps) {
  return (
    <form className="flex w-36 items-center gap-1">
      <input type="text" className="w-full bg-zinc-900" />
      <button className="transition-transform hover:scale-110">
        <AiOutlineCheck size={20} />
      </button>
      <button
        type="button"
        onClick={cancelEdit}
        className="transition-transform hover:scale-110"
      >
        <AiOutlineClose size={20} />
      </button>
    </form>
  )
}

export default EditForm
