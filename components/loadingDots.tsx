function LoadingDots() {
  return (
    <div className="flex justify-center gap-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-100 duration-75" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-100 duration-100" />
      <div className="duration-125 h-2 w-2 animate-bounce rounded-full bg-slate-100" />
    </div>
  )
}

export default LoadingDots
