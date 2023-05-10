import type { InputHTMLAttributes, DetailedHTMLProps } from "react"
import { useFormContext } from "react-hook-form"

interface TextInputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  name: string
  placeholder: string
  defaultValue?: string
}

function TextInput({ name, ...props }: TextInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <input
      id={name}
      type="text"
      {...register(name)}
      {...props}
      className={`w-44 border bg-zinc-900 p-1 text-xl ${
        errors[name] ? "border-red-800" : "border-transparent"
      } `}
    />
  )
}

export default TextInput
