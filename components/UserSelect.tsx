import { trpc } from "@/utils/trpc"
import React, { useEffect, useState } from "react"
import Select from "react-select"
import { useDebounce } from "@/hooks/useDebounce"

interface UserSelectProps {
  selectedUsers: string[]
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>
}

function UserSelect({ selectedUsers, setSelectedUsers }: UserSelectProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedQuery = useDebounce<string>(searchQuery, 500)

  const userOptions = trpc.project.getAllUsers.useQuery(debouncedQuery)

  const utils = trpc.useContext()

  useEffect(() => {
    utils.project.getAllUsers.invalidate()
  }, [searchQuery, utils.project.getAllUsers])

  const filteredOptions =
    userOptions.data?.filter((u) => u.name?.includes(debouncedQuery)) || []

  return (
    <Select
      options={
        filteredOptions.map((u) => ({ label: u.name!, value: u.name! })) || []
      }
      inputValue={searchQuery}
      onInputChange={(value) => setSearchQuery(value)}
      defaultValue={selectedUsers.map((u) => ({ label: u, value: u }))}
      onChange={(value) => setSelectedUsers(value.map((v) => v.value!))}
      isMulti
      placeholder="type to find user"
      noOptionsMessage={() =>
        userOptions.isLoading ? "loading..." : "no users found"
      }
      styles={{
        control: (base, state) => ({
          ...base,
          backgroundColor: "rgb(24 24 27)",
          height: 40,
          border: state.isFocused ? "rgb(248 250 252)" : "none",
          borderRadius: 0,
          boxShadow: state.isFocused
            ? "0px 0px 0px 1px rgba(248, 250, 252, 1)"
            : "none",
        }),
        singleValue: (base) => ({ ...base, color: "rgb(241 245 249)" }),
        menu: (base) => ({ ...base, backgroundColor: "rgb(24 24 27)" }),
        input: (base) => ({ ...base, color: "rgb(241 245 249)" }),
        dropdownIndicator: (base) => ({ ...base, color: "rgb(241 245 249)" }),
        multiValue: (base) => ({ ...base, backgroundColor: "rgb(63 63 70)" }),
        multiValueLabel: (base) => ({ ...base, color: "rgb(241 245 249)" }),
        placeholder: (base) => ({ ...base, color: "rgb(163 163 163)" }),
        option: (base, state) => ({
          ...base,
          backgroundColor:
            state.isFocused && !state.isSelected
              ? "rgb(63 63 70)"
              : state.isSelected
              ? "rgb(39 39 42)"
              : "rgb(24 24 27)",
        }),
      }}
    />
  )
}

export default UserSelect
