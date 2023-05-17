import TextInput from "./TextInput"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import { useContext, useState } from "react"
import AddButton from "./AddButton"
import PlusIcon from "./PlusIcon"
import UserCheckbox from "./UserCheckbox"
import ModalForm from "./ModalForm"
import FormFieldContainer from "./FormFieldContainer"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { trpc } from "@/utils/trpc"
import LayoutContext from "@/context/LayoutContext"
import useAssignUser from "@/hooks/useAssignUser"
import { taskSchema } from "@/types/schemas"
import { type User } from "@prisma/client"

interface AddTaskModalProps {
  close: () => void
  listId: string
}

function AddTaskModal({ close, listId }: AddTaskModalProps) {
  const [date, onChange] = useState<Date | null>(new Date())

  const { chosenBoardId } = useContext(LayoutContext)

  const { assignedUsers, assignUser } = useAssignUser()

  const users = trpc.board.getUsers.useQuery(chosenBoardId!)

  const utils = trpc.useContext()

  const createTask = trpc.task.create.useMutation({
    onSuccess: () => {
      utils.board.getById.invalidate(chosenBoardId!)
      close()
    },
  })

  type TaskSchema = z.infer<typeof taskSchema>

  const methods = useForm<TaskSchema>({
    defaultValues: { listId },
    resolver: zodResolver(taskSchema),
  })

  const onSubmit: SubmitHandler<TaskSchema> = (data) => {
    createTask.mutate({
      name: data.name,
      assigned_to: assignedUsers,
      listId,
      due_to: date!,
    })
  }

  return (
    <FormProvider {...methods}>
      <ModalForm close={close} handleSubmit={methods.handleSubmit(onSubmit)}>
        <h2 className="pb-4 text-center font-bold">add a new task</h2>
        <FormFieldContainer>
          <label htmlFor="name">task name</label>
          <div className="[&>input]:w-full [&>input]:text-base">
            <TextInput name="name" placeholder="add dark theme" />
          </div>
          {methods.formState.errors && (
            <p role="alert" className="text-red-500">
              {methods.formState.errors?.name?.message}
            </p>
          )}
        </FormFieldContainer>
        <FormFieldContainer>
          <p>assign users</p>
          <div className="flex flex-wrap gap-2">
            {users.data?.map((user: User) => (
              <UserCheckbox
                key={user.id}
                name={user.name!}
                id={user.id}
                assignUser={assignUser}
              />
            ))}
          </div>
        </FormFieldContainer>
        <FormFieldContainer>
          <label htmlFor="datetime">due to</label>
          <DateTimePicker
            onChange={onChange}
            value={date}
            disableClock
            minDate={new Date()}
            clearIcon={null}
            calendarIcon={null}
            format="y-MM-dd h:mm a"
            className="w-fit"
          />
        </FormFieldContainer>
        <AddButton disabled={createTask.isLoading}>
          add task
          <div className={`${createTask.isLoading && "animate-spin"}`}>
            <PlusIcon />
          </div>
        </AddButton>
        <>
          {createTask.error && (
            <p role="alert" className="text-center text-red-500">
              something went wrong
            </p>
          )}
        </>
      </ModalForm>
    </FormProvider>
  )
}

export default AddTaskModal
