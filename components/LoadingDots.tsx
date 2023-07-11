interface LoadingDotsProps {
  className?: string
  dotClassName?: string
}

export function LoadingDots({
  className,
  dotClassName = "h-2 w-2",
}: LoadingDotsProps) {
  return (
    <div className={`flex justify-center gap-2 pt-2 ${className}`}>
      <div
        className={`animate-bounceLeft rounded-full bg-slate-100 ${dotClassName}`}
      />
      <div
        className={`animate-bounceCenter rounded-full bg-slate-100 ${dotClassName}`}
      />
      <div
        className={`animate-bounceRight rounded-full bg-slate-100 ${dotClassName}`}
      />
    </div>
  )
}
