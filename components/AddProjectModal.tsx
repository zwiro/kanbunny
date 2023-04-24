import AddButton from "./AddButton"
import FormFieldContainer from "./FormFieldContainer"
import ModalForm from "./ModalForm"
import PlusIcon from "./PlusIcon"
import TextInput from "./TextInput"

interface AddProjectModalProps {
  cancel?: () => void
}

function AddProjectModal({ cancel }: AddProjectModalProps) {
  return (
    <ModalForm cancel={cancel}>
      <h2 className="pb-4 text-center font-bold">add a new project</h2>
      <FormFieldContainer>
        <label htmlFor="project-name">project name</label>
        <TextInput name="project-name" placeholder="social platform" />
      </FormFieldContainer>
      <FormFieldContainer>
        <p>invite users</p>
        <div className="flex items-center gap-2">
          <TextInput name="users" placeholder="johndoe21" />
          <button type="button" className="group">
            <PlusIcon />
          </button>
        </div>
        <p>invited (3)</p>
        <ul className="flex gap-2">
          <li className="border border-zinc-900 p-2">johnny</li>
          <li className="border border-zinc-900 p-2">bobby</li>
          <li className="border border-zinc-900 p-2">adamson</li>
        </ul>
      </FormFieldContainer>
      <AddButton handleClick={cancel}>
        <>
          add project <PlusIcon />
        </>
      </AddButton>
    </ModalForm>
  )
}

export default AddProjectModal
