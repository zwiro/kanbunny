import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import MenuButton from "./MenuButton"
import MenuItem from "./MenuItem"
import AddEditForm from "./AddEditForm"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import AddProjectModal, { projectSchema } from "./AddProjectModal"
import useClickOutside from "@/hooks/useClickOutside"
import React, { FormEventHandler, useContext, useRef, useState } from "react"
import LayoutContext from "@/context/LayoutContext"
import ColorPicker from "./ColorPicker"
import TextInput from "./TextInput"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai"
import useInviteUser from "@/hooks/useInviteUser"
import { trpc } from "@/utils/trpc"
import { Board, Prisma, Project, User } from "@prisma/client"
import { LoadingDots } from "./LoadingDots"
import { FormProvider, SubmitHandler, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

function SideMenu() {
  const [isAdding, add, closeAdd] = useAddOrEdit()
  const sideMenuAnimation = {
    initial: { x: "-100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
    transition: { type: "tween" },
  }

  const userProjects = trpc.project.user.useQuery()

  return (
    <>
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-16 w-11/12 overflow-y-scroll bg-zinc-800 px-24 py-8 text-2xl lg:px-36 lg:text-3xl [&>button]:my-0"
      >
        {!userProjects.isLoading ? (
          <AddButton handleClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <LoadingDots />
        )}
        {userProjects.data?.length
          ? userProjects.data
              ?.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
              .map((project) => (
                <Project
                  key={project.id}
                  project={project}
                  boards={project.boards}
                  invites={project.invited_users}
                />
              ))
          : !userProjects.isLoading && (
              <p className="text-netural-500 text-center">no projects yet</p>
            )}
      </motion.aside>
      <AnimatePresence>
        {isAdding && <AddProjectModal close={closeAdd} />}
      </AnimatePresence>
    </>
  )
}

interface ProjectProps {
  project: Project
  boards: Board[]
  invites: User[]
}

export const boardSchema = z.object({
  name: z.string().min(1, { message: "board name is required" }),
  projectId: z.string(),
})

function Project({ project, boards, invites }: ProjectProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingUsers, editUsers, closeEditUsers] = useAddOrEdit()
  const [isAdding, add, closeAdd] = useAddOrEdit()
  const {
    user,
    invitedUsers,
    inviteUser,
    removeUser,
    handleChange,
    resetUsers,
  } = useInviteUser([...invites.map((user) => user.name!)])
  const methods = useForm<BoardSchema>({
    defaultValues: { projectId: project.id },
    resolver: zodResolver(boardSchema),
  })

  const createBoard = trpc.project.createBoard.useMutation({
    onSuccess() {
      utils.project.invalidate()
      closeAdd()
      methods.reset()
    },
  })

  type BoardSchema = z.infer<typeof boardSchema>

  const updateUsers = trpc.project.editUsers.useMutation({
    onSuccess() {
      utils.project.invalidate()
      resetUsers()
    },
  })

  const utils = trpc.useContext()
  const onSubmit: SubmitHandler<BoardSchema> = (data: any) => {
    createBoard.mutate({ name: data.name, projectId: project.id })
  }

  const handleSubmitUsers = (e: React.FormEvent) => {
    e.preventDefault()
    updateUsers.mutate({ projectId: project.id, invites: invitedUsers })
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
          <p>{project.name}</p>
          <MenuButton>
            <MenuItem handleClick={add}>add board</MenuItem>
            <MenuItem handleClick={editUsers}>edit users</MenuItem>
            <MenuItem handleClick={editName}>edit project name</MenuItem>
            <MenuItem>delete project</MenuItem>
          </MenuButton>
        </div>
      ) : (
        <div className="pt-1.5">
          <AddEditForm
            name="project-name"
            placeholder="project name"
            close={closeEditName}
          />
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
              <p>invited ({invitedUsers.length})</p>
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
                      disabled={!invitedUsers.length}
                      className={`transition-transform hover:scale-110 disabled:hover:scale-100`}
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
              <FormProvider {...methods}>
                <AddEditForm
                  name="name"
                  placeholder="board name"
                  handleSubmit={methods.handleSubmit(onSubmit)}
                  close={closeAdd}
                  isLoading={createBoard.isLoading}
                />
              </FormProvider>
            </div>
            {methods.formState.errors && (
              <p role="alert" className="pl-6 text-base text-red-500">
                {methods.formState.errors?.name?.message as string}
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

interface BoardProps {
  name: string
  color: string
}

function Board({ name, color }: BoardProps) {
  const [isEditingName, editName, closeEditName] = useAddOrEdit()
  const [isEditingColor, editColor, closeEditColor] = useAddOrEdit()

  return (
    <li className="group flex items-center gap-2 text-xl">
      <div
        onClick={editColor}
        className={`relative h-4 w-4 rounded-full bg-${color}-500`}
      >
        <AnimatePresence>
          {isEditingColor && <ColorPicker close={closeEditColor} />}
        </AnimatePresence>
      </div>
      {!isEditingName ? (
        <>
          <p>{name}</p>
          <div
            className={`z-10 scale-0 transition-transform ${
              isEditingColor ? "group-hover:scale-0" : "group-hover:scale-100"
            } `}
          >
            <MenuButton>
              <MenuItem handleClick={editName}>edit board name</MenuItem>
              <MenuItem handleClick={editColor}>change color</MenuItem>
              <MenuItem>delete board</MenuItem>
            </MenuButton>
          </div>
        </>
      ) : (
        <div className="">
          <AddEditForm
            name="board-name"
            placeholder="board name"
            close={closeEditName}
          />
        </div>
      )}
    </li>
  )
}

export default SideMenu
