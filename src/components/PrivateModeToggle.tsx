import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrivateModeToggleProps {
  isPrivate: boolean
  onToggle: () => void
  className?: string
}

export const PrivateModeToggle: React.FC<PrivateModeToggleProps> = ({
  isPrivate,
  onToggle,
  className
}) => {
  return (
    <Button
      variant={isPrivate ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isPrivate && "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
        className
      )}
      title={`${isPrivate ? 'Exit' : 'Enter'} Private Mode`}
    >
      {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="text-xs font-medium">
        {isPrivate ? 'Private' : 'Normal'}
      </span>
    </Button>
  )
}