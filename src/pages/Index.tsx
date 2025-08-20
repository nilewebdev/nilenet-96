
import { Browser } from '@/components/Browser'
import { Profile } from '@/components/Profile'
import { Settings } from '@/components/Settings'
import { useState } from 'react'

const Index = () => {
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleOpenProfile = () => {
    setShowProfile(true)
    setShowSettings(false)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
    setShowProfile(false)
  }

  const handleCloseProfile = () => {
    setShowProfile(false)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Main Browser Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Browser 
          onOpenProfile={handleOpenProfile}
          onOpenSettings={handleOpenSettings}
        />
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl border max-h-[90vh] overflow-hidden">
            <Profile onClose={handleCloseProfile} onOpenSettings={handleOpenSettings} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl border max-h-[90vh] overflow-hidden">
            <Settings onClose={handleCloseSettings} onOpenProfile={handleOpenProfile} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Index
