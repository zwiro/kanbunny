import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"

interface AddEditFormProps {
  name: string
  placeholder: string
  cancel?: () => void
}

function AddEditForm({ name, placeholder, cancel }: AddEditFormProps) {
  return (
    <form className="flex items-center gap-1">
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-44 bg-zinc-900 p-1 text-xl"
      />
      <button className="ml-auto transition-transform hover:scale-110">
        <AiOutlineCheck size={20} />
      </button>
      <button
        type="button"
        onClick={cancel}
        className="transition-transform hover:scale-110"
      >
        <AiOutlineClose size={20} />
      </button>
    </form>
  )
}

export default AddEditForm
