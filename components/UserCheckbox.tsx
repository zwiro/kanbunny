interface UserCheckboxProps {
  name: string
  id: string
  assignUser: (user: string) => void
  isAssigned?: boolean
}

function UserCheckbox({ name, id, assignUser, isAssigned }: UserCheckboxProps) {
  return (
    <div>
      <input
        type="checkbox"
        id={name}
        name={name}
        onChange={() => assignUser(id)}
        defaultChecked={isAssigned}
        className="peer hidden"
      />
      <label
        htmlFor={name}
        className={`block cursor-pointer border border-zinc-900 p-2 transition-colors hover:bg-zinc-950 peer-checked:bg-zinc-900`}
      >
        {name}
      </label>
    </div>
  )
}

export default UserCheckbox
