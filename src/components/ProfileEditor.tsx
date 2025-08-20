
import React, { useState } from 'react'
import { User, Palette, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

interface ProfileEditorProps {
  onClose: () => void
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ onClose }) => {
  const { user, profile, updateProfile } = useAuth()
  const [nickname, setNickname] = useState(profile?.nickname || '')
  const [selectedColor, setSelectedColor] = useState(profile?.profile_color || 'blue')
  const [isSaving, setIsSaving] = useState(false)

  const colorOptions = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
  ]

  const handleSave = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      await updateProfile({
        nickname,
        profile_color: selectedColor,
        updated_at: new Date().toISOString()
      })
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      })
      
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getColorForValue = (value: string) => {
    return colorOptions.find(color => color.value === value)?.class || 'bg-blue-500'
  }

  return (
    <Card className="w-full max-w-md h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          <div className="space-y-6 pb-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${getColorForValue(selectedColor)} flex items-center justify-center text-white font-bold text-xl`}>
                {nickname ? nickname.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">
                  {nickname || user?.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Nickname Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="transition-all duration-200 focus:scale-105"
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed instead of your email
              </p>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Profile Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-12 h-12 rounded-full ${color.class} flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      selectedColor === color.value 
                        ? 'ring-4 ring-offset-2 ring-offset-background ring-primary' 
                        : 'hover:ring-2 ring-offset-1 ring-offset-background ring-muted'
                    }`}
                  >
                    {selectedColor === color.value && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose a color for your profile avatar
              </p>
            </div>

            {/* Account Info */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium">Account Details</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Member since {new Date(user?.created_at || '').toLocaleDateString()}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-primary to-accent"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-current mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
