import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import AddProjectModal from "./AddProjectModal"
import React from "react"
import ColorPicker from "./ColorPicker"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import useInviteUser from "@/hooks/useInviteUser"
import { trpc } from "@/utils/trpc"
import type { Project, User } from "@prisma/client"
import { LoadingDots } from "./LoadingDots"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSession } from "next-auth/react"
import Board from "./Boards"

interface ProjectProps {
  project: Project
  boards: Board[]
  participants: User[]
}

export const boardSchema = z.object({
  name: z.string().min(1, { message: "name is required" }),
  projectId: z.string(),
})

type BoardSchema = z.infer<typeof boardSchema>

function Project({ project, boards, participants }: ProjectProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingUsers, editUsers, closeEditUsers] = useAddOrEdit()
  const [isAdding, add, closeAdd] = useAddOrEdit()
  const { user, invitedUsers, inviteUser, removeUser, handleChange } =
    useInviteUser([...participants.map((user) => user.name!)])

  const boardMethods = useForm<BoardSchema>({
    defaultValues: { projectId: project.id },
    resolver: zodResolver(boardSchema),
  })

  const projectMethods = useForm<BoardSchema>({
    defaultValues: { projectId: project.id, name: project.name },
    resolver: zodResolver(boardSchema),
  })

  const createBoard = trpc.board.create.useMutation({
    async onMutate(newBoard) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === newBoard.projectId
            ? {
                ...p,
                boards: [...p.boards, { ...newBoard, color: "red" } as Board],
              }
            : p
        )
      )
      return { prevData }
    },
    onError(err, newBoard, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
      closeAdd()
      boardMethods.reset()
    },
  })

  const updateUsers = trpc.project.editUsers.useMutation({
    onSuccess() {
      utils.project.getByUser.invalidate()
    },
  })

  const updateName = trpc.project.editName.useMutation({
    async onMutate(updatedProject) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.map((p) =>
          p.id === updatedProject.projectId
            ? { ...p, name: updatedProject.name }
            : p
        )
      )
      return { prevData }
    },
    onError(err, updatedProject, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
      closeEditName()
    },
  })

  const deleteProject = trpc.project.delete.useMutation({
    async onMutate(deletedProjectId) {
      await utils.project.getByUser.cancel()
      const prevData = utils.project.getByUser.getData()
      utils.project.getByUser.setData(undefined, (old) =>
        old?.filter((p) => p.id !== deletedProjectId)
      )
      return { prevData }
    },
    onError(err, deletedProjectId, ctx) {
      utils.project.getByUser.setData(undefined, ctx?.prevData)
    },
    onSettled() {
      utils.project.getByUser.invalidate()
    },
  })

  const utils = trpc.useContext()
  const onSubmit: SubmitHandler<BoardSchema> = (data: any) => {
    createBoard.mutate({ name: data.name, projectId: project.id })
  }

  const handleSubmitUsers = (e: React.FormEvent) => {
    e.preventDefault()
    updateUsers.mutate({ projectId: project.id, participants: invitedUsers })
  }

  const onSubmitName: SubmitHandler<BoardSchema> = (data: any) => {
    updateName.mutate({ name: data.name, projectId: project.id })
  }

  const projectUsersAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  }

  return (
    <section className="my-4 border-b border-neutral-700">
      {!isEditingName ? (
        <div className="flex items-center gap-4">
          <p>{!deleteProject.isLoading ? project.name : <LoadingDots />}</p>
          <MenuButton>
            <MenuItem handleClick={add}>add board</MenuItem>
            <MenuItem handleClick={editUsers}>edit users</MenuItem>
            <MenuItem handleClick={editName}>edit project name</MenuItem>
            <MenuItem handleClick={() => deleteProject.mutate(project.id)}>
              delete project
            </MenuItem>
          </MenuButton>
        </div>
      ) : (
        <div className="pt-1.5">
          <FormProvider {...projectMethods}>
            <AddEditForm
              name="name"
              placeholder="project name"
              handleSubmit={projectMethods.handleSubmit(onSubmitName)}
              defaultValue={project.name}
              isLoading={updateName.isLoading}
              close={closeEditName}
            />
          </FormProvider>
          {projectMethods.formState.errors && (
            <p role="alert" className="text-base text-red-500">
              {projectMethods.formState.errors?.name?.message as string}
            </p>
          )}
        </div>
      )}
      <AnimatePresence>
        {isEditingUsers && (
          <motion.div
            {...projectUsersAnimation}
            className="flex flex-col gap-2 pt-4 text-base"
          >
            <form onSubmit={handleSubmitUsers} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  id="user"
                  type="text"
                  placeholder="johndoe211"
                  className={`w-44 border bg-zinc-900 p-1 text-xl`}
                  value={user}
                  onChange={handleChange}
                />
                <button onClick={inviteUser} className="group">
                  <PlusIcon />
                </button>
              </div>
              <p>invited or participating ({invitedUsers.length})</p>
              <ul className="flex flex-wrap gap-2">
                {invitedUsers.map((user, i) => (
                  <li
                    key={`${user}-${i}`}
                    onClick={() => removeUser(user)}
                    className="cursor-pointer border border-zinc-900 bg-zinc-900 p-2 transition-colors hover:bg-transparent"
                  >
                    {user}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1">
                {!updateUsers.isLoading ? (
                  <>
                    <button
                      type="submit"
                      className="transition-transform hover:scale-110 disabled:hover:scale-100"
                    >
                      <AiOutlineCheck size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={closeEditUsers}
                      className="transition-transform hover:scale-110"
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  </>
                ) : (
                  <div className="mr-auto h-6">
                    <LoadingDots />
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <ul className="flex flex-col gap-2 py-4 lg:gap-4">
        {isAdding && (
          <>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-500" />
              <FormProvider {...boardMethods}>
                <AddEditForm
                  name="name"
                  placeholder="board name"
                  handleSubmit={boardMethods.handleSubmit(onSubmit)}
                  close={closeAdd}
                  isLoading={createBoard.isLoading}
                />
              </FormProvider>
            </div>
            {boardMethods.formState.errors && (
              <p role="alert" className="pl-6 text-base text-red-500">
                {boardMethods.formState.errors?.name?.message as string}
              </p>
            )}
          </>
        )}
        {boards.length ? (
          boards.map((board) => <Board key={board.id} {...board} />)
        ) : (
          <p className="text-base font-bold text-neutral-500">no boards yet</p>
        )}
      </ul>
    </section>
  )
}

export default Project
