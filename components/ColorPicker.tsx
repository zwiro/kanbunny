import useClickOutside from "@/hooks/useClickOutside"
import { useRef } from "react"
import { color, motion } from "framer-motion"
import { z } from "zod"
import { trpc } from "@/utils/trpc"

interface ColorPickerProps {
  close: () => void
  id: string
  projectId: string
}

export const colorSchema = z.object({
  color: z.enum(["red", "blue", "green", "yellow", "pink"]),
  id: z.string(),
  projectId: z.string(),
})

type ColorSchema = z.infer<typeof colorSchema>

function ColorPicker({ close, id, projectId }: ColorPickerProps) {
  const pickerRef = useRef(null)
  useClickOutside([pickerRef], close)

  const pickerAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const utils = trpc.useContext()

  const editColor = trpc.board.editColor.useMutation({
    async onMutate(updatedBoard) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === projectId
            ? {
                ...p,
                boards: p.boards.map((b) =>
                  b.id === updatedBoard.id
                    ? { ...b, color: updatedBoard.color }
                    : b
                ),
              }
            : p
        )
      )
      return { prevData }
    },
    onError(err, updatedBoard, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled: () => {
      close()
      utils.project.getByUser.invalidate()
    },
  })

  const pickColor = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target instanceof HTMLButtonElement) {
      const color = e.target.dataset.color as ColorSchema["color"]
      editColor.mutate({ id, projectId, color })
    }
  }

  return (
    <motion.div
      {...pickerAnimation}
      ref={pickerRef}
      className="absolute -left-2 -top-2 flex gap-2 bg-zinc-900 p-2"
      onClick={pickColor}
    >
      <button
        className="relative h-4 w-4 rounded-full bg-red-500 hover:brightness-125"
        data-color={colorSchema.shape.color.enum.red}
      />
      <button
        className="relative h-4 w-4 rounded-full bg-blue-500 hover:brightness-125"
        data-color={colorSchema.shape.color.enum.blue}
      />
      <button
        className="relative h-4 w-4 rounded-full bg-green-500 hover:brightness-125"
        data-color={colorSchema.shape.color.enum.green}
      />
      <button
        className="relative h-4 w-4 rounded-full bg-yellow-500 hover:brightness-125"
        data-color={colorSchema.shape.color.enum.yellow}
      />
      <button
        className="relative h-4 w-4 rounded-full bg-pink-500 hover:brightness-125"
        data-color={colorSchema.shape.color.enum.pink}
      />
    </motion.div>
  )
}

export default ColorPicker
