
import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NativeConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'destructive'
}

export const NativeConfirmDialog: React.FC<NativeConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
  variant = 'default'
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4">
      <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 w-full max-w-xs mx-auto animate-scale-in">
        {/* Header */}
        <div className="text-center p-6 pb-4">
          {variant === 'destructive' && (
            <div className="mb-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="border-t border-border/50">
          <div className="grid grid-cols-2">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="h-12 rounded-none border-r border-border/50 font-medium hover:bg-muted/50"
            >
              {cancelText}
            </Button>
            <Button
              variant="ghost"
              onClick={onConfirm}
              className={`h-12 rounded-none font-medium ${
                variant === 'destructive' 
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' 
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
