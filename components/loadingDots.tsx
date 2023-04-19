function LoadingDots() {
  return (
    <div className="ml-auto flex justify-center gap-2 pt-2">
      <div className="h-2 w-2 animate-bounceLeft rounded-full bg-slate-100" />
      <div className="h-2 w-2 animate-bounceCenter rounded-full bg-slate-100" />
      <div className="h-2 w-2 animate-bounceRight rounded-full bg-slate-100" />
    </div>
  )
}

export default LoadingDots
