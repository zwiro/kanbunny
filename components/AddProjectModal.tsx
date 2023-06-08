import { z } from "zod"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { trpc } from "@/utils/trpc"
import { projectSchema } from "@/utils/schemas"
import useAddUser from "@/hooks/useAddUser"
import AddButton from "./AddButton"
import FormFieldContainer from "./FormFieldContainer"
import ModalForm from "./ModalForm"
import PlusIcon from "./PlusIcon"
import TextInput from "./TextInput"
import { createNewProject } from "@/mutations/projectMutations"
import AddUsersInput from "./AddUsersInput"

interface AddProjectModalProps {
  close: () => void
}

function AddProjectModal({ close }: AddProjectModalProps) {
  const { user, users, addUser, removeUser, handleChange } = useAddUser()

  const utils = trpc.useContext()

  const createProject = createNewProject(utils)

  type ProjectSchema = z.infer<typeof projectSchema>

  const methods = useForm<ProjectSchema>({
    resolver: zodResolver(projectSchema),
  })

  const onSubmit: SubmitHandler<ProjectSchema> = (data: any) => {
    createProject.mutate({
      name: data.name,
      users,
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
          <AddUsersInput
            value={user}
            onChange={handleChange}
            addUser={addUser}
            removeUser={removeUser}
            length={users.length}
            users={users}
          />
        </FormFieldContainer>
        <AddButton disabled={createProject.isLoading}>
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
