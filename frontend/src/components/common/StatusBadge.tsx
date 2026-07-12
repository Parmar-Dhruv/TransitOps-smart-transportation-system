import { cn } from "../../lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  maintenance: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
  "out of service": "bg-red-500/10 text-red-500 ring-red-500/20",
  available: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
  "on trip": "bg-blue-500/10 text-blue-500 ring-blue-500/20",
  "off duty": "bg-slate-500/10 text-slate-500 ring-slate-500/20",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase()
  const defaultStyle = "bg-primary/10 text-primary ring-primary/20"
  const style = statusStyles[normalizedStatus] || defaultStyle

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        style,
        className
      )}
    >
      {status}
    </span>
  )
}
