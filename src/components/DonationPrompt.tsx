import React from 'react'
import { AlertTriangle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DonationPromptProps {
  siteName?: string
  onClose?: () => void
}

export const DonationPrompt: React.FC<DonationPromptProps> = ({ siteName = 'this site', onClose }) => {
  const handleDonate = () => {
    window.open('https://buymeacoffee.com/your-username', '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg p-6 max-w-sm w-full space-y-4 animate-scale-in">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            this wont work atm, donate to see it wrk*
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {siteName.toLowerCase()} needs proxy support* help us add it*
          </p>
          
          <Button 
            onClick={handleDonate}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Heart className="h-4 w-4 mr-2" />
            donate for proxy support*
          </Button>

          {onClose && (
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full text-xs text-muted-foreground"
            >
              go back*
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}