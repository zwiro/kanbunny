interface UserCheckboxProps {
  name: string
  assignUser?: (user: string) => void
}

function UserCheckbox({ name, assignUser }: UserCheckboxProps) {
  return (
    <div>
      <input
        type="checkbox"
        id={name}
        name={name}
        onChange={assignUser ? () => assignUser(name) : undefined}
        className="peer hidden"
      />
      <label
        htmlFor={name}
        className="block cursor-pointer border border-zinc-900 p-2 transition-colors hover:bg-zinc-950 peer-checked:bg-zinc-900"
      >
        {name}
      </label>
    </div>
  )
}

export default UserCheckbox
