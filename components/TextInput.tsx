import { useFormContext } from "react-hook-form"

interface TextInputProps {
  name: string
  placeholder: string
  defaultValue?: string
}

function TextInput({ placeholder, name, defaultValue }: TextInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <input
      id={name}
      type="text"
      {...register(name)}
      placeholder={placeholder}
      // defaultValue={defaultValue}
      className={`w-44 border bg-zinc-900 p-1 text-xl ${
        errors[name] ? "border-red-800" : "border-transparent"
      } `}
    />
  )
}

export default TextInput
