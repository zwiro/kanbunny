import { useState } from "react"

interface UserCheckboxProps {
  name: string
  id: string
  assignUser: (user: string) => void
  isAssigned?: boolean
}

function UserCheckbox({ name, id, assignUser, isAssigned }: UserCheckboxProps) {
  const [isChecked, setIsChecked] = useState(isAssigned)

  const check = (id: string) => {
    setIsChecked((prevChecked) => !prevChecked)
    assignUser(id)
  }

  return (
    <div>
      <input
        type="checkbox"
        id={name}
        name={name}
        onChange={() => check(id)}
        checked={isChecked}
        defaultChecked={isAssigned}
        className="peer hidden"
      />
      <label
        htmlFor={name}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.click()
          }
        }}
        className={`block cursor-pointer border border-zinc-900 p-2 transition-colors hover:bg-zinc-950 focus-visible:bg-zinc-950 peer-checked:bg-zinc-900`}
      >
        {name}
      </label>
    </div>
  )
}

export default UserCheckbox
