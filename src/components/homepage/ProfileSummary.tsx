
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ProfileSummaryProps {
  user: any
  currentTime: Date
}

export const ProfileSummary: React.FC<ProfileSummaryProps> = ({ user, currentTime }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getLastSyncTime = () => {
    if (!user) return null
    return 'Synced 5 min ago'
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            {user ? (
              <>
                <h3 className="font-semibold text-base">welcome back, {user.email?.split('@')[0]}*</h3>
                <p className="text-xs text-muted-foreground">{getLastSyncTime()?.toLowerCase()}*</p>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-base">sign in to sync*</h3>
                <p className="text-xs text-muted-foreground">keep your data in sync*</p>
              </>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{formatTime(currentTime)}</div>
            <div className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
