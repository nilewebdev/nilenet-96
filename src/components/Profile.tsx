import React, { useState, useEffect } from 'react'
import { User, Mail, Settings, LogOut, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from './LoginModal'
import { ProfileEditor } from './ProfileEditor'

interface ProfileProps {
  onClose: () => void
  onOpenSettings: () => void
}

export const Profile: React.FC<ProfileProps> = ({ onClose, onOpenSettings }) => {
  const { user, profile, signOut } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)

  // Auto-redirect to profile editor after login
  useEffect(() => {
    if (user && !justLoggedIn) {
      setJustLoggedIn(true)
      // Small delay to let the user see they're logged in
      setTimeout(() => {
        setShowProfileEditor(true)
      }, 500)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      setJustLoggedIn(false)
      onClose()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSyncing(false)
  }

  const handleSignInClick = () => {
    setShowLoginModal(true)
  }

  const handleLoginModalClose = () => {
    setShowLoginModal(false)
  }

  if (!user) {
    return (
      <>
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Not signed in
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Sign in to sync your tabs, bookmarks, and settings across devices.
            </p>
            <Button onClick={handleSignInClick} className="w-full">
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>
        
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={handleLoginModalClose} 
        />
      </>
    )
  }

  // Show profile editor if requested
  if (showProfileEditor) {
    return <ProfileEditor onClose={() => setShowProfileEditor(false)} />
  }

  const displayName = profile?.nickname || user.email
  const profileColor = profile?.profile_color || 'blue'
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      teal: 'from-teal-500 to-teal-600',
      indigo: 'from-indigo-500 to-indigo-600',
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getColorClass(profileColor)} flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform`}
                 onClick={() => setShowProfileEditor(true)}>
              {displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium">{displayName}</div>
              <div className="text-sm text-muted-foreground">
                {profile?.nickname ? user.email : `Member since ${new Date(user.created_at || '').toLocaleDateString()}`}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2">
            <Badge variant="secondary">
              <Mail className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <Badge variant="outline">
              Theme: {profile?.theme || 'Default'}
            </Badge>
          </div>
        </div>

        {/* Sync Status */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Account Sync</span>
            <Badge variant="outline" className="text-green-600 border-green-200">
              ✓ Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Your tabs, bookmarks, and settings are automatically synced.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-2"></div>
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                Force Sync
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowProfileEditor(true)}
            className="w-full justify-start"
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          
          <Button
            variant="outline"
            onClick={onOpenSettings}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings & Preferences
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleLoginModalClose} 
      />
    </Card>
  )
}
