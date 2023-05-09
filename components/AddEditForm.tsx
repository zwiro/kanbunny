import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import TextInput from "./TextInput"
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form"
import { z } from "zod"
import { trpc } from "@/utils/trpc"
import { zodResolver } from "@hookform/resolvers/zod"
import FormFieldContainer from "./FormFieldContainer"
import { LoadingDots } from "./LoadingDots"

interface AddEditFormProps {
  name: string
  placeholder: string
  close: () => void
  projectId?: string
  handleSubmit?: SubmitHandler<any>
  isLoading?: boolean
  defaultValue?: string
}

function AddEditForm({
  name,
  placeholder,
  close,
  handleSubmit,
  isLoading,
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
      {!isLoading ? (
        <>
          <button
            type="submit"
            className="transition-transform hover:scale-110"
          >
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
      ) : (
        <div className="mr-auto">
          <LoadingDots />
        </div>
      )}
    </form>
  )
}

export default AddEditForm
