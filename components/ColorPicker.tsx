interface ColorPickerProps {
  cancel?: () => void
}

function ColorPicker({ cancel }: ColorPickerProps) {
  return (
    <div
      onClick={cancel}
      className="absolute -left-2 -top-2 z-20 flex gap-2 bg-zinc-900 p-2"
    >
      <div className="relative h-4 w-4 rounded-full bg-red-500" />
      <div className="relative h-4 w-4 rounded-full bg-blue-500" />
      <div className="relative h-4 w-4 rounded-full bg-green-500" />
      <div className="relative h-4 w-4 rounded-full bg-yellow-500" />
      <div className="relative h-4 w-4 rounded-full bg-pink-500" />
    </div>
  )
}

export default ColorPicker
