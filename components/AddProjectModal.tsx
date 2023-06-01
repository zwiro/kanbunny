import AddButton from "./AddButton"
import FormFieldContainer from "./FormFieldContainer"
import ModalForm from "./ModalForm"
import PlusIcon from "./PlusIcon"
import TextInput from "./TextInput"
import useAddUser from "@/hooks/useAddUser"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { trpc } from "@/utils/trpc"
import { projectSchema } from "@/types/schemas"

interface AddProjectModalProps {
  close: () => void
}

function AddProjectModal({ close }: AddProjectModalProps) {
  const { user, users, addUser, removeUser, handleChange } = useAddUser()

  const utils = trpc.useContext()

  const createProject = trpc.project.create.useMutation({
    onSuccess() {
      utils.project.getByUser.invalidate()
      close()
    },
  })

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
          <p>add users</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="johndoe"
              className="w-44 bg-zinc-900 p-1 text-xl"
              value={user}
              onChange={handleChange}
            />
            <button onClick={addUser} className="group">
              <PlusIcon />
            </button>
          </div>
          <p>participating ({users.length})</p>
          <ul className="flex flex-wrap gap-2">
            {users.map((user, i) => (
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
