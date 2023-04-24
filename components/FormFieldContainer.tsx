export default function FormFieldContainer({
  children,
}: {
  children: JSX.Element[]
}) {
  return (
    <div className="flex flex-col gap-2 border border-neutral-700 p-4">
      {children}
    </div>
  )
}
