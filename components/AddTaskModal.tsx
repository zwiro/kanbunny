import { useContext, useState } from "react"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/utils/trpc"
import { taskSchema } from "@/utils/schemas"
import { createNewTask } from "@/mutations/taskMutations"
import FocusLock from "react-focus-lock"
import LayoutContext from "@/context/LayoutContext"
import useAssignUser from "@/hooks/useAssignUser"
import TextInput from "./TextInput"
import AddButton from "./AddButton"
import PlusIcon from "./PlusIcon"
import UserCheckbox from "./UserCheckbox"
import ModalForm from "./ModalForm"
import FormFieldContainer from "./FormFieldContainer"
import useCloseOnEscape from "@/hooks/useCloseOnEscape"

interface AddTaskModalProps {
  close: () => void
  listId: string
}

function AddTaskModal({ close, listId }: AddTaskModalProps) {
  useCloseOnEscape(close)

  const [date, onChange] = useState<Date | null>()

  const { chosenBoard } = useContext(LayoutContext)

  const { assignedUsers, assignUser } = useAssignUser()

  const users = trpc.board.getUsers.useQuery(chosenBoard?.id!)

  const utils = trpc.useContext()

  const createTask = createNewTask(chosenBoard?.id!, utils, close)

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
    <FocusLock>
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
              {users.isLoading && (
                <>
                  <div className="block h-[42px] w-16 animate-pulse bg-zinc-700 p-2" />
                  <div className="block h-[42px] w-12 animate-pulse bg-zinc-700 p-2" />
                  <div className="block h-[42px] w-24 animate-pulse bg-zinc-700 p-2" />
                </>
              )}
              {users.data?.map((user) => (
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
            <p>due to</p>
            <DateTimePicker
              onChange={onChange}
              value={date}
              disableClock
              minDate={new Date()}
              calendarIcon={null}
              format="y-MM-dd h:mm a"
              className="w-fit"
              amPmAriaLabel="Select AM/PM"
              dayAriaLabel="Day"
              hourAriaLabel="Hour"
              minuteAriaLabel="Minute"
              monthAriaLabel="Month"
              yearAriaLabel="Year"
              nativeInputAriaLabel="Due to"
              clearAriaLabel="Clear value"
            />
          </FormFieldContainer>
          <AddButton disabled={createTask.isLoading}>
            add task
            <div className={`${createTask.isLoading && "animate-spin"}`}>
              <PlusIcon />
            </div>
          </AddButton>
          {createTask.error && (
            <p role="alert" className="text-center text-red-500">
              something went wrong
            </p>
          )}
        </ModalForm>
      </FormProvider>
    </FocusLock>
  )
}

export default AddTaskModal
