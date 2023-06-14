import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import { SubmitHandler, useFormContext } from "react-hook-form"
import TextInput from "./TextInput"

interface AddEditFormProps {
  name: string
  placeholder: string
  close: () => void
  projectId?: string
  handleSubmit?: SubmitHandler<any>
  defaultValue?: string
}

function AddEditForm({
  name,
  placeholder,
  close,
  handleSubmit,
  defaultValue,
}: AddEditFormProps) {
  const { reset } = useFormContext()

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <TextInput
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      <>
        <button type="submit" className="transition-transform hover:scale-110">
          <AiOutlineCheck size={20} />
        </button>
        <button
          type="button"
          onClick={() => {
            reset({}, { keepDefaultValues: true })
            close()
          }}
          className="transition-transform hover:scale-110"
        >
          <AiOutlineClose size={20} />
        </button>
      </>
    </form>
  )
}

export default AddEditForm
