interface TextInputProps {
  name: string
  placeholder: string
  value?: string
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function TextInput({ name, placeholder, value, handleChange }: TextInputProps) {
  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className="w-44 bg-zinc-900 p-1 text-xl"
    />
  )
}

export default TextInput
