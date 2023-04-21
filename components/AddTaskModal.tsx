import Input from "./Input"
import DateTimePicker from "react-datetime-picker"
import "react-datetime-picker/dist/DateTimePicker.css"
import { useState } from "react"
import AddButton from "./AddButton"

function AddTaskModal() {
  const [value, onChange] = useState<Date | null>(new Date())

  return (
    <div className="fixed left-0 top-0 z-30 h-screen w-screen bg-zinc-900/90">
      <form className="grid h-full place-items-center">
        <div className="bg-zinc-800 p-12">
          <div className="flex items-center gap-2">
            <label htmlFor="task-name">task name</label>
            <div className="ml-auto">
              <Input name="task-name" placeholder="add dark theme" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p>assign users</p>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="janek" className="ml-auto">
                janek
              </label>
              <input type="checkbox" id="janek" name="janek" />
              <label htmlFor="janek" className="ml-auto">
                daniel
              </label>
              <input type="checkbox" id="daniel" name="daniel" />
              <label htmlFor="daniel" className="ml-auto">
                john
              </label>
              <input type="checkbox" id="john" name="john" />
              <label htmlFor="john" className="ml-auto">
                bobby
              </label>
              <input type="checkbox" id="bobby" name="bobby" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="datetime">due to</label>
            <DateTimePicker
              onChange={onChange}
              value={value}
              disableClock
              minDate={new Date()}
              clearIcon={null}
              calendarIcon={null}
              format="y-MM-dd h:mm a"
              className="ml-auto"
            />
          </div>
          <AddButton>add task</AddButton>
        </div>
      </form>
    </div>
  )
}

export default AddTaskModal
