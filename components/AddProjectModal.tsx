import { useState } from "react"
import AddButton from "./AddButton"
import FormFieldContainer from "./FormFieldContainer"
import ModalForm from "./ModalForm"
import PlusIcon from "./PlusIcon"
import TextInput from "./TextInput"
import useInviteUser from "@/hooks/useInviteUser"

interface AddProjectModalProps {
  cancel?: () => void
}

function AddProjectModal({ cancel }: AddProjectModalProps) {
  const { user, invitedUsers, inviteUser, removeUser, handleChange } =
    useInviteUser()

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
          <TextInput
            name="users"
            placeholder="johndoe21"
            handleChange={handleChange}
            value={user}
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
              className="border border-zinc-900 p-2"
            >
              {user}
            </li>
          ))}
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
