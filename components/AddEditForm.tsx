import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import TextInput from "./TextInput"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"
import { trpc } from "@/utils/trpc"
import { zodResolver } from "@hookform/resolvers/zod"

interface AddEditFormProps {
  name: string
  placeholder: string
  close: () => void
  projectId?: string
}

export const boardSchema = z.object({
  name: z.string().min(1, { message: "board name is required" }),
  projectId: z.string(),
})

function AddEditForm({
  name,
  placeholder,
  close,
  projectId,
}: AddEditFormProps) {
  const createBoard = trpc.project.createBoard.useMutation({
    onSuccess() {
      close()
    },
  })

  type BoardSchema = z.infer<typeof boardSchema>

  const methods = useForm<BoardSchema>({
    defaultValues: { projectId: projectId! },
    resolver: zodResolver(boardSchema),
  })

  console.log(methods.formState.errors)

  const utils = trpc.useContext()
  const onSubmit: SubmitHandler<BoardSchema> = (data: any) => {
    createBoard.mutate({ name: data.name, projectId: projectId! })
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex items-center gap-1"
      >
        <TextInput name={name} placeholder={placeholder} />
        <button
          type="submit"
          className="ml-auto transition-transform hover:scale-110"
        >
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
    </FormProvider>
  )
}

export default AddEditForm
