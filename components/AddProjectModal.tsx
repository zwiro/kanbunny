import { useState } from "react"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/utils/trpc"
import { projectSchema } from "@/utils/schemas"
import { createNewProject } from "@/mutations/projectMutations"
import FormFieldContainer from "./FormFieldContainer"
import AddButton from "./AddButton"
import ModalForm from "./ModalForm"
import PlusIcon from "./PlusIcon"
import TextInput from "./TextInput"
import UserSelect from "./UserSelect"

interface AddProjectModalProps {
  close: () => void
}

function AddProjectModal({ close }: AddProjectModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const utils = trpc.useContext()

  const createProject = createNewProject(utils, close)

  type ProjectSchema = z.infer<typeof projectSchema>

  const methods = useForm<ProjectSchema>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit: SubmitHandler<ProjectSchema> = (data: any) => {
    createProject.mutate({
      name: data.name,
      users: selectedUsers,
    })
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
              {methods.formState.errors?.name?.message}
            </p>
          )}
        </FormFieldContainer>
        <FormFieldContainer>
          <label htmlFor="name">add users</label>
          <p className="text-sm text-neutral-500">
            {selectedUsers.length} participant
            {selectedUsers.length === 1 ? "" : "s"}
          </p>
          <UserSelect
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
          />
        </FormFieldContainer>
        <AddButton disabled={createProject.isLoading}>
          add project
          <div className={`${createProject.isLoading && "animate-spin"}`}>
            <PlusIcon />
          </div>
        </AddButton>
        {createProject.error && (
          <p role="alert" className="text-center text-red-500">
            something went wrong
          </p>
        )}
      </ModalForm>
    </FormProvider>
  )
}

export default AddProjectModal
