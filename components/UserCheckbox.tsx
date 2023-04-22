interface UserCheckboxProps {
  name: string
}

function UserCheckbox({ name }: UserCheckboxProps) {
  return (
    <div>
      <input type="checkbox" id={name} name={name} className="peer hidden" />
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
