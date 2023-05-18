import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import AddProjectModal from "./AddProjectModal"
import React from "react"
import { LoadingDots } from "./LoadingDots"
import { useSession } from "next-auth/react"
import Project from "./Project"
import type { Board, ProjectUser, User } from "@prisma/client"

interface SideMenuProps {
  data:
    | (Project & {
        owner: User
        boards: Board[]
        users: ProjectUser[]
        invited_users: User[]
      })[]
    | undefined
  isLoading: boolean
}

function SideMenu({ data, isLoading }: SideMenuProps) {
  const { data: session } = useSession()

  const [isAdding, add, closeAdd] = useAddOrEdit()

  const sideMenuAnimation = {
    initial: { x: "-100vw" },
    animate: { x: 0 },
    exit: { x: "-100vw" },
    transition: { type: "tween" },
  }

  return (
    <>
      <motion.aside
        onClick={(e) => e.stopPropagation()}
        {...sideMenuAnimation}
        className="fixed bottom-0 left-0 top-16 w-11/12 overflow-y-scroll bg-zinc-800 px-24 py-8 text-2xl lg:px-36 lg:text-3xl [&>button]:my-0"
      >
        {!isLoading ? (
          <AddButton onClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <LoadingDots />
        )}
        {!!data?.length &&
          data?.map((project) => (
            <Project
              key={project.id}
              project={project}
              boards={project.boards}
              participants={[
                ...project.invited_users,
                ...project.users.filter((user) => user.id !== session?.user.id),
              ]}
            />
          ))}
        {!data?.length && !isLoading && (
          <p className="text-netural-500 text-center">no projects yet</p>
        )}
      </motion.aside>
      <AnimatePresence>
        {isAdding && <AddProjectModal close={closeAdd} />}
      </AnimatePresence>
    </>
  )
}

export default SideMenu
