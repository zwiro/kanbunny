function ExpandChevron() {
  return (
    <div className="relative rotate-180 before:absolute before:-left-1 before:top-0 before:h-1 before:w-5 before:rotate-45 before:bg-slate-100 before:transition-transform after:absolute after:-right-1 after:top-0 after:h-1 after:w-5 after:-rotate-45 after:bg-slate-100 after:transition-transform group-hover:before:-rotate-45 group-hover:after:rotate-45" />
  )
}

export default ExpandChevron
