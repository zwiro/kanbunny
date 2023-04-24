import Input from "./TextInput"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import { useState } from "react"
import AddButton from "./AddButton"
import PlusIcon from "./PlusIcon"
import UserCheckbox from "./UserCheckbox"
import { motion } from "framer-motion"

interface AddTaskModalProps {
  cancel?: () => void
}

function AddTaskModal({ cancel }: AddTaskModalProps) {
  const [value, onChange] = useState<Date | null>(new Date())

  const modalVariant = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  }

  const formVariant = {
    hidden: {
      scale: 0,
    },
    visible: {
      scale: 1,
    },
  }

  return (
    <motion.div
      variants={modalVariant}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed left-0 top-0 z-30 grid h-screen w-screen place-items-center bg-zinc-900/90"
    >
      <form className="grid h-full w-3/4 place-items-center">
        <motion.div
          variants={formVariant}
          className="bg-zinc-800 p-12 [&>div:first-child]:border-b-0 [&>div:nth-last-child(2)]:border-t-0"
        >
          <h2 className="pb-4 text-center font-bold">add a new task</h2>
          <FormFieldContainer>
            <label htmlFor="task-name">task name</label>
            <div className="[&>input]:w-full [&>input]:text-base">
              <Input name="task-name" placeholder="add dark theme" />
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
          <AddButton handleClick={cancel}>
            <>
              add task <PlusIcon />
            </>
          </AddButton>
        </motion.div>
      </form>
    </motion.div>
  )
}

function FormFieldContainer({ children }: { children: JSX.Element[] }) {
  return (
    <div className="flex flex-col gap-2 border border-neutral-700 p-4">
      {children}
    </div>
  )
}
export default AddTaskModal
