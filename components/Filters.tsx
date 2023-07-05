import { type ChangeEvent, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AiFillFilter,
  AiOutlineClose,
  AiOutlineFilter,
  AiOutlineSearch,
} from "react-icons/ai"
import DateTimePicker from "react-datetime-picker"
import useBooleanState from "@/hooks/useBooleanState"
import useClickOutside from "@/hooks/useClickOutside"
import useCloseOnEscape from "@/hooks/useCloseOnEscape"

interface FiltersProps {
  searchQuery: string
  search: (e: ChangeEvent<HTMLInputElement>) => void
  resetQuery: () => void
  assignedFilter: string | null
  dateFilter: Date | string | null
  handleAssignedFilterChange: (e: ChangeEvent<HTMLInputElement>) => void
  handleDateFilterChange: (e: ChangeEvent<HTMLInputElement>) => void
  clearFilters: () => void
  setDateFilter: React.Dispatch<React.SetStateAction<Date | string | null>>
  hideEmptyLists: boolean
  toggleHideEmptyLists: () => void
}

function Filters({
  searchQuery,
  search,
  resetQuery,
  assignedFilter,
  dateFilter,
  handleAssignedFilterChange,
  handleDateFilterChange,
  clearFilters,
  setDateFilter,
  hideEmptyLists,
  toggleHideEmptyLists,
}: FiltersProps) {
  const [isSearchOpen, , , toggleSearch] = useBooleanState()
  const [isFilterOpen, , closeFilter, toggleFilter] = useBooleanState()

  const filterRef = useRef<HTMLDivElement>(null)
  useClickOutside([filterRef], closeFilter)

  const closeSearchAndReset = () => {
    resetQuery()
    toggleSearch()
  }

  const buttonAnimation = {
    initial: { opacity: 0, rotate: -360 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 360 },
    transition: { duration: 0.3 },
  }

  const inputAnimation = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "auto", opacity: 1 },
    exit: { width: 0, opacity: 0 },
  }

  return (
    <div className="relative ml-auto">
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={toggleFilter}
          aria-label={`${isFilterOpen ? "Close" : "Open"} filters`}
        >
          {dateFilter || assignedFilter ? (
            <AiFillFilter size={32} />
          ) : (
            <AiOutlineFilter
              size={32}
              className="transition-transform hover:scale-110 focus:scale-110"
            />
          )}
        </button>
        <div className="flex">
          <button
            onClick={isSearchOpen ? closeSearchAndReset : toggleSearch}
            aria-label={`${isSearchOpen ? "Close" : "Open"} searchbar`}
          >
            <AnimatePresence mode="wait">
              <motion.div>
                {isSearchOpen ? (
                  <motion.div {...buttonAnimation} key="glass">
                    <AiOutlineClose
                      size={32}
                      className="transition-transform focus:scale-110"
                    />
                  </motion.div>
                ) : (
                  <motion.div {...buttonAnimation} key="close">
                    <AiOutlineSearch
                      size={32}
                      className="transition-transform hover:scale-110 focus:scale-110"
                    />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </button>
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div {...inputAnimation}>
                <input
                  value={searchQuery}
                  onChange={search}
                  type="search"
                  placeholder="add dark mode..."
                  className="h-full w-full bg-zinc-900 px-1"
                  aria-label="Search"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div ref={filterRef}>
        <AnimatePresence>
          {isFilterOpen && (
            <FiltersMenu
              assignedFilter={assignedFilter}
              clearFilters={clearFilters}
              dateFilter={dateFilter}
              handleAssignedFilterChange={handleAssignedFilterChange}
              handleDateFilterChange={handleDateFilterChange}
              setDateFilter={setDateFilter}
              closeFilter={closeFilter}
              hideEmptyLists={hideEmptyLists}
              toggleHideEmptyLists={toggleHideEmptyLists}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface FiltersMenuProps {
  handleAssignedFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDateFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  assignedFilter: string | null
  dateFilter: string | Date | null
  setDateFilter: React.Dispatch<React.SetStateAction<Date | string | null>>
  clearFilters: () => void
  closeFilter: () => void
  hideEmptyLists: boolean
  toggleHideEmptyLists: () => void
}

function FiltersMenu({
  handleAssignedFilterChange,
  handleDateFilterChange,
  assignedFilter,
  dateFilter,
  setDateFilter,
  clearFilters,
  closeFilter,
  hideEmptyLists,
  toggleHideEmptyLists,
}: FiltersMenuProps) {
  useCloseOnEscape(closeFilter)

  const filterAnimation = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <motion.div
      {...filterAnimation}
      className="absolute right-0 z-30 origin-top-right whitespace-nowrap bg-zinc-900/95 p-4 shadow-md shadow-black"
    >
      <fieldset className="flex items-center gap-1">
        <legend>task state</legend>
        <FilterButton
          value="assigned_user"
          name="task_type"
          filter={assignedFilter}
          handleChange={handleAssignedFilterChange}
          inputClassName="peer/assigned_user"
          labelClassName="peer-checked/assigned_user:bg-zinc-700"
        >
          assigned to me
        </FilterButton>
        <FilterButton
          value="assigned"
          name="task_type"
          filter={assignedFilter}
          handleChange={handleAssignedFilterChange}
          inputClassName="peer/assigned"
          labelClassName="peer-checked/assigned:bg-zinc-700"
        >
          assigned
        </FilterButton>
        <FilterButton
          value="unassigned"
          name="task_type"
          filter={assignedFilter}
          handleChange={handleAssignedFilterChange}
          inputClassName="peer/unassigned"
          labelClassName="peer-checked/unassigned:bg-zinc-700"
        >
          unassigned
        </FilterButton>
      </fieldset>
      <fieldset className="flex flex-wrap items-center gap-1">
        <legend>due to</legend>
        <FilterButton
          value="tomorrow"
          name="due_to"
          filter={dateFilter}
          handleChange={handleDateFilterChange}
          inputClassName="peer/tomorrow"
          labelClassName="peer-checked/tomorrow:bg-zinc-700"
        >
          tomorrow
        </FilterButton>
        <FilterButton
          value="next_week"
          name="due_to"
          filter={dateFilter}
          handleChange={handleDateFilterChange}
          inputClassName="peer/next_week"
          labelClassName="peer-checked/next_week:bg-zinc-700"
        >
          next week
        </FilterButton>
        <FilterButton
          value="next_month"
          name="due_to"
          filter={dateFilter}
          handleChange={handleDateFilterChange}
          inputClassName="peer/next_month"
          labelClassName="peer-checked/next_month:bg-zinc-700"
        >
          next month
        </FilterButton>
        <DateTimePicker
          onChange={setDateFilter}
          value={Boolean(dateFilter instanceof Date) ? dateFilter : null}
          disableClock
          calendarIcon={null}
          format="y-MM-dd h:mm a"
          className="border border-zinc-700"
          amPmAriaLabel="Select AM/PM"
          dayAriaLabel="Day"
          hourAriaLabel="Hour"
          minuteAriaLabel="Minute"
          monthAriaLabel="Month"
          yearAriaLabel="Year"
          nativeInputAriaLabel="Due to"
          clearAriaLabel="Clear value"
        />
      </fieldset>
      <div className="my-2 flex items-center gap-1 accent-zinc-700">
        <input
          type="checkbox"
          id="hide-empty-lists"
          checked={hideEmptyLists}
          onChange={toggleHideEmptyLists}
        />
        <label htmlFor="hide-empty-lists">hide empty lists</label>
      </div>
      <button
        onClick={clearFilters}
        className="bg-zinc-700 px-2 py-1 transition-colors hover:bg-zinc-800 focus-visible:bg-zinc-800"
      >
        clear filters
      </button>
    </motion.div>
  )
}

interface FilterButtonProps {
  value: string
  name: string
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  filter: string | Date | null
  inputClassName: string
  labelClassName: string
  children: React.ReactNode | string
}

function FilterButton({
  value,
  name,
  handleChange,
  filter,
  inputClassName,
  labelClassName,
  children,
}: FilterButtonProps) {
  return (
    <>
      <input
        type="radio"
        id={value}
        value={value}
        name={name}
        onChange={handleChange}
        checked={filter === value}
        className={`hidden ${inputClassName}`}
      />
      <motion.label
        whileTap={{ scale: 1.1 }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.click()
          }
        }}
        tabIndex={0}
        htmlFor={value}
        className={`cursor-pointer border border-zinc-700 px-1 transition-colors hover:bg-zinc-800 focus:bg-zinc-800 ${labelClassName}`}
      >
        {children}
      </motion.label>
    </>
  )
}

export default Filters
