import PlusIcon from "./PlusIcon"
import AddButton from "./AddButton"
import { AnimatePresence, motion } from "framer-motion"
import useAddOrEdit from "@/hooks/useAddOrEdit"
import AddProjectModal from "./AddProjectModal"
import React from "react"
import { trpc } from "@/utils/trpc"
import { LoadingDots } from "./LoadingDots"
import { useSession } from "next-auth/react"
import Project from "./Project"

function SideMenu() {
  const [isAdding, add, closeAdd] = useAddOrEdit()

  const userProjects = trpc.project.getByUser.useQuery()

  const { data: session } = useSession()

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
        {!userProjects.isLoading ? (
          <AddButton onClick={add}>
            new project <PlusIcon />
          </AddButton>
        ) : (
          <LoadingDots />
        )}
        {!!userProjects.data?.length &&
          userProjects.data?.map((project) => (
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
        {!userProjects.data?.length && !userProjects.isLoading && (
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
