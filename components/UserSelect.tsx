import { trpc } from "@/utils/trpc"
import { User } from "@prisma/client"
import React, { useEffect, useState } from "react"
import AsyncSelect from "react-select/async"
import Select from "react-select"
import { useDebounce } from "@/hooks/useDebounce"

function UserSelect() {
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
        filteredOptions.map((u) => ({ label: u.name, value: u.name })) || []
      }
      inputValue={searchQuery}
      onInputChange={(value) => setSearchQuery(value)}
      placeholder="find user"
      noOptionsMessage={() =>
        userOptions.isLoading ? "loading" : "no users found"
      }
      styles={{
        control: (base) => ({ ...base, backgroundColor: "rgb(24 24 27)" }),
        singleValue: (base) => ({ ...base, color: "rgb(241 245 249)" }),
        menu: (base) => ({ ...base, backgroundColor: "rgb(24 24 27)" }),
        dropdownIndicator: (base) => ({ ...base, color: "rgb(241 245 249)" }),
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
