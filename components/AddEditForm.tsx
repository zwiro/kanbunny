import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import TextInput from "./TextInput"

interface AddEditFormProps {
  name: string
  placeholder: string
  close?: () => void
}

function AddEditForm({ name, placeholder, close }: AddEditFormProps) {
  return (
    <form className="flex items-center gap-1">
      <TextInput name={name} placeholder={placeholder} />
      <button className="ml-auto transition-transform hover:scale-110">
        <AiOutlineCheck size={20} />
      </button>
      <button
        type="button"
        onClick={close}
        className="transition-transform hover:scale-110"
      >
        <AiOutlineClose size={20} />
      </button>
    </form>
  )
}

export default AddEditForm
