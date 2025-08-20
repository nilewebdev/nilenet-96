
import React from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title?: string
  description?: string
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  open,
  onOpenChange,
  url,
  title = "Oh no!",
  description = "This page failed to load, open in external browser?"
}) => {
  const openExternally = () => {
    window.open(url, '_blank')
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] max-w-md mx-auto rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-background to-background/80 backdrop-blur-xl">
        <AlertDialogHeader className="text-center pb-4">
          <div className="text-6xl mb-4 animate-bounce">😔</div>
          <AlertDialogTitle className="text-2xl font-bold text-destructive mb-2">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <AlertDialogCancel 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto rounded-xl border-2 hover:scale-105 transition-all duration-200 font-medium"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={openExternally}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl hover:scale-105 transition-all duration-200 font-medium shadow-lg"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Browser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
