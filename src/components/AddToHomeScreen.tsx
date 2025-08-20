import React, { useState, useEffect } from 'react'
import { X, Smartphone, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddToHomeScreenProps {
  onDismiss: () => void
}

export const AddToHomeScreen: React.FC<AddToHomeScreenProps> = ({ onDismiss }) => {
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Auto show instructions after 2 seconds
    const timer = setTimeout(() => setShowInstructions(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleAddToHomeScreen = () => {
    // Try to trigger the native add to home screen
    if ('BeforeInstallPromptEvent' in window) {
      window.dispatchEvent(new Event('beforeinstallprompt'))
    }
    setShowInstructions(true)
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg p-6 max-w-sm w-full space-y-4 animate-scale-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <h2 className="text-lg font-semibold">n.n*</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            add n.n* to your home screen for the best experience*
          </p>
          
          <Button 
            onClick={handleAddToHomeScreen}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4 mr-2" />
            add to home screen*
          </Button>

          {showInstructions && (
            <div className="space-y-2 text-xs text-muted-foreground animate-fade-in">
              <p>manual steps:</p>
              <ul className="space-y-1 pl-2">
                <li>• tap share button*</li>
                <li>• select "add to home screen"*</li>
                <li>• tap "add"*</li>
              </ul>
            </div>
          )}

          <Button 
            variant="ghost" 
            onClick={onDismiss}
            className="w-full text-xs text-muted-foreground"
          >
            continue in browser*
          </Button>
        </div>
      </div>
    </div>
  )
}