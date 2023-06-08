import PlusIcon from "./PlusIcon"

interface AddUsersInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addUser: (e: React.MouseEvent<Element, MouseEvent>) => void
  removeUser: (user: string) => void
  length: number
  users: string[]
}

function AddUsersInput({
  value,
  onChange,
  addUser,
  removeUser,
  length,
  users,
}: AddUsersInputProps) {
  return (
    <>
      <p>add users</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="johndoe"
          className="w-44 bg-zinc-900 p-1 text-xl"
          value={value}
          onChange={onChange}
        />
        <button onClick={addUser} className="group">
          <PlusIcon />
        </button>
      </div>
      <p>participating ({length})</p>
      <ul className="flex flex-wrap gap-2">
        {users.map((user, i) => (
          <li
            key={`${user}-${i}`}
            onClick={() => removeUser(user)}
            className="cursor-pointer border border-zinc-900 bg-zinc-900 p-2 transition-colors hover:bg-transparent"
          >
            {user}
          </li>
        ))}
      </ul>
    </>
  )
}

export default AddUsersInput
