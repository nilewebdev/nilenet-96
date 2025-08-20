
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ProfileColorPickerProps {
  currentColor: string
  onColorChange: (color: string) => void
}

const colorOptions = [
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
  { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Orange', value: '#F59E0B', bg: 'bg-orange-500' },
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500' }
]

export const ProfileColorPicker: React.FC<ProfileColorPickerProps> = ({
  currentColor,
  onColorChange
}) => {
  const [selectedColor, setSelectedColor] = useState(currentColor)

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    onColorChange(color)
    
    // Save to localStorage immediately
    localStorage.setItem('nile-profile-color', color)
    
    toast({
      title: "Profile Color Updated",
      description: "Your profile color has been saved successfully.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Palette className="h-5 w-5" />
          Profile Color
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {colorOptions.map((color) => (
            <Button
              key={color.value}
              variant="outline"
              onClick={() => handleColorSelect(color.value)}
              className={`h-12 w-full relative ${color.bg} border-2 ${
                selectedColor === color.value 
                  ? 'border-foreground ring-2 ring-ring' 
                  : 'border-muted hover:border-foreground/50'
              }`}
            >
              {selectedColor === color.value && (
                <Check className="h-4 w-4 text-white drop-shadow-lg" />
              )}
              <span className="sr-only">{color.name}</span>
            </Button>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Selected: {colorOptions.find(c => c.value === selectedColor)?.name || 'Custom'}
        </div>
      </CardContent>
    </Card>
  )
}
