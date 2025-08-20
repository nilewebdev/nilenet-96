
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Weather {
  temp: number
  condition: string
  icon: string
}

interface WeatherGreetingProps {
  greeting: { text: string; icon: string }
  weather: Weather | null
}

export const WeatherGreeting: React.FC<WeatherGreetingProps> = ({ greeting, weather }) => {
  return (
    <Card className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/20">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{greeting.icon}</span>
            <div>
              <h3 className="font-semibold text-base">{greeting.text.toLowerCase()}*</h3>
              <p className="text-xs text-muted-foreground">have a great session*</p>
            </div>
          </div>
          {weather && (
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-lg">{weather.icon}</span>
                <span className="font-semibold text-sm">{weather.temp}°C</span>
              </div>
              <div className="text-xs text-muted-foreground">{weather.condition.toLowerCase()}*</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
