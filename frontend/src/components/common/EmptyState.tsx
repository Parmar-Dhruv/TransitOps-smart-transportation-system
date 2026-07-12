import { LucideIcon } from "lucide-react"
import { Button } from "./Button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 ring-8 ring-primary/5">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="premium">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
