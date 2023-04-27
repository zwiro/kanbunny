import { useState } from "react"
import AddButton from "./AddButton"
import FormFieldContainer from "./FormFieldContainer"
import ModalForm from "./ModalForm"
import PlusIcon from "./PlusIcon"
import TextInput from "./TextInput"
import useInviteUser from "@/hooks/useInviteUser"
import {
  useForm,
  FormProvider,
  useFormContext,
  SubmitHandler,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/utils/trpc"
import { Prisma, User } from "@prisma/client"

interface AddProjectModalProps {
  close: () => void
}

export const projectSchema = z.object({
  name: z.string().min(1, { message: "project name is required" }),
  invited_users: z.array(z.string()).optional(),
})

function AddProjectModal({ close }: AddProjectModalProps) {
  const { user, invitedUsers, inviteUser, removeUser, handleChange } =
    useInviteUser()

  const createProject = trpc.project.create.useMutation({ onSuccess: close })

  type ProjectSchema = z.infer<typeof projectSchema>

  const methods = useForm<ProjectSchema>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit: SubmitHandler<ProjectSchema> = (data: any) => {
    createProject.mutate({ name: data.name, invited_users: invitedUsers })
  }

  return (
    <FormProvider {...methods}>
      <ModalForm close={close} handleSubmit={methods.handleSubmit(onSubmit)}>
        <h2 className="pb-4 text-center font-bold">add a new project</h2>
        <FormFieldContainer>
          <label htmlFor="name">project name</label>
          <TextInput name="name" placeholder="social platform" />
          {methods.formState.errors && (
            <p role="alert" className="text-red-500">
              {methods.formState.errors.name?.message}
            </p>
          )}
        </FormFieldContainer>
        <FormFieldContainer>
          <p>invite users</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="johndoe"
              className="w-44 bg-zinc-900 p-1 text-xl"
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
        </FormFieldContainer>
        <AddButton isLoading={createProject.isLoading}>
          add project
          <div className={`${createProject.isLoading && "animate-spin"}`}>
            <PlusIcon />
          </div>
        </AddButton>
        <>
          {createProject.error && (
            <p role="alert" className="text-center text-red-500">
              something went wrong
            </p>
          )}
        </>
      </ModalForm>
    </FormProvider>
  )
}

export default AddProjectModal
