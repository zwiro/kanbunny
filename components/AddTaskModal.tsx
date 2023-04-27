import TextInput from "./TextInput"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import { useState } from "react"
import AddButton from "./AddButton"
import PlusIcon from "./PlusIcon"
import UserCheckbox from "./UserCheckbox"
import { motion } from "framer-motion"
import ModalForm from "./ModalForm"
import FormFieldContainer from "./FormFieldContainer"
import { useRef } from "react"
import useClickOutside from "@/hooks/useClickOutside"

interface AddTaskModalProps {
  close?: () => void
}

function AddTaskModal({ close }: AddTaskModalProps) {
  const [value, onChange] = useState<Date | null>(new Date())

  return (
    <ModalForm close={close}>
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
      <AddButton handleClick={close}>
        add task <PlusIcon />
      </AddButton>
    </ModalForm>
  )
}

export default AddTaskModal
