import { useRef } from "react"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import { SubmitHandler, useFormContext } from "react-hook-form"
import useClickOutside from "@/hooks/useClickOutside"
import useCloseOnEscape from "@/hooks/useCloseOnEscape"
import TextInput from "./TextInput"

interface AddEditFormProps {
  name: string
  placeholder: string
  close: () => void
  projectId?: string
  handleSubmit?: SubmitHandler<any>
  defaultValue?: string
  className?: string
}

function AddEditForm({
  name,
  placeholder,
  close,
  handleSubmit,
  defaultValue,
  className,
}: AddEditFormProps) {
  const { reset } = useFormContext()

  const resetField = () => {
    reset({}, { keepDefaultValues: true })
    close()
  }

  useCloseOnEscape(resetField)

  const formRef = useRef<HTMLFormElement>(null)

  useClickOutside([formRef], resetField)

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`flex items-center gap-1 ${className} `}
    >
      <TextInput
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      <button
        type="submit"
        onClick={(e) => e.stopPropagation()}
        className="transition-transform hover:scale-110 focus:scale-110"
        aria-label="Submit"
      >
        <AiOutlineCheck size={20} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          resetField()
        }}
        className="transition-transform hover:scale-110 focus:scale-110"
        aria-label="Cancel"
      >
        <AiOutlineClose size={20} />
      </button>
    </form>
  )
}

export default AddEditForm
