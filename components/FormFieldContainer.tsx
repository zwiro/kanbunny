export default function FormFieldContainer({
  children,
}: {
  children: JSX.Element[]
}) {
  return (
    <div className="field flex flex-col gap-2 border border-neutral-700 p-4 [&_input]:w-full [&_input]:text-base">
      {children}
    </div>
  )
}
