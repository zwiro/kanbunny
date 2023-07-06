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
      autoFocus
      {...props}
      className={`h-10 w-44 border bg-zinc-900 p-1 text-xl placeholder:text-neutral-400 focus:border-slate-50 ${
        errors[name] ? "border-red-800" : "border-transparent"
      } `}
      aria-label={props.placeholder}
    />
  )
}

export default TextInput
