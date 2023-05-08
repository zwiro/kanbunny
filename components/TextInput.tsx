import { useFormContext } from "react-hook-form"

interface TextInputProps {
  name: string
  placeholder: string
}

function TextInput({ placeholder, name }: TextInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <input
        id={name}
        type="text"
        {...register(name)}
        placeholder={placeholder}
        className={`w-44 border bg-zinc-900 p-1 text-xl ${
          errors[name] ? "border-red-800" : "border-transparent"
        } `}
      />
      {errors && (
        <p role="alert" className="text-red-500">
          {errors[name]?.message as string}
        </p>
      )}
    </>
  )
}

export default TextInput
