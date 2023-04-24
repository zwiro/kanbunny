interface InputProps {
  name: string
  placeholder: string
}

function Input({ name, placeholder }: InputProps) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className="w-44 bg-zinc-900 p-1"
    />
  )
}

export default Input
