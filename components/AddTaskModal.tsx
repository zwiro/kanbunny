import TextInput from "./TextInput"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import { useContext, useState } from "react"
import AddButton from "./AddButton"
import PlusIcon from "./PlusIcon"
import UserCheckbox from "./UserCheckbox"
import { motion } from "framer-motion"
import ModalForm from "./ModalForm"
import FormFieldContainer from "./FormFieldContainer"
import { useRef } from "react"
import useClickOutside from "@/hooks/useClickOutside"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { trpc } from "@/utils/trpc"
import LayoutContext from "@/context/LayoutContext"

interface AddTaskModalProps {
  close: () => void
  listId: string
}

export const taskSchema = z.object({
  name: z.string().min(1, { message: "task name is required" }),
  assigned_users: z.array(z.string()).optional(),
  due_to: z.date(),
  listId: z.string(),
})

type TaskSchema = z.infer<typeof taskSchema>

function AddTaskModal({ close, listId }: AddTaskModalProps) {
  const [value, onChange] = useState<Date | null>(new Date())
  const { chosenBoardId } = useContext(LayoutContext)

  const methods = useForm<TaskSchema>({
    defaultValues: { listId },
    resolver: zodResolver(taskSchema),
  })

  const utils = trpc.useContext()

  const createTask = trpc.task.create.useMutation({
    // async onMutate(createdTask) {
    //   await utils.board.getById.cancel()
    //   const prevData = utils.board.getById.getData()
    //   utils.board.getById.setData(
    //     chosenBoardId!,
    //     (old) => old.
    //   )
    //   return { prevData }
    // },
    // onError(err, createdTask, ctx) {
    //   utils.board.getById.setData(chosenBoardId!, ctx?.prevData)
    // },
    onSettled: () => {
      utils.board.getById.invalidate(chosenBoardId!)
      close()
    },
  })

  const onSubmit: SubmitHandler<TaskSchema> = (data) => {
    createTask.mutate({
      name: data.name,
    })
  }

  // handle assigned users and finish (fetch users assigned to project and show then handle adding them to the task)

  return (
    <FormProvider {...methods}>
      <ModalForm close={close} handleSubmit={methods.handleSubmit(onSubmit)}>
        <h2 className="pb-4 text-center font-bold">add a new task</h2>
        <FormFieldContainer>
          <label htmlFor="task-name">task name</label>
          <div className="[&>input]:w-full [&>input]:text-base">
            <TextInput name="task-name" placeholder="add dark theme" />
          </div>
        </FormFieldContainer>
        <FormFieldContainer>
          <p>assign users</p>
          <div className="flex flex-wrap gap-2">
            <UserCheckbox name="janek" />
            <UserCheckbox name="john" />
            <UserCheckbox name="bobby" />
            <UserCheckbox name="adam" />
            <UserCheckbox name="jimmy" />
            <UserCheckbox name="daniel" />
          </div>
        </FormFieldContainer>
        <FormFieldContainer>
          <label htmlFor="datetime">due to</label>
          <DateTimePicker
            onChange={onChange}
            value={value}
            disableClock
            minDate={new Date()}
            clearIcon={null}
            calendarIcon={null}
            format="y-MM-dd h:mm a"
            className="w-fit"
          />
        </FormFieldContainer>
        <AddButton onClick={close}>
          add task <PlusIcon />
        </AddButton>
      </ModalForm>
    </FormProvider>
  )
}

export default AddTaskModal
