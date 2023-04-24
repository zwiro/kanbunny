interface TextInputProps {
  name: string
  placeholder: string
}

function TextInput({ name, placeholder }: TextInputProps) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      className="w-44 bg-zinc-900 p-1 text-xl"
    />
  )
}

export default TextInput
