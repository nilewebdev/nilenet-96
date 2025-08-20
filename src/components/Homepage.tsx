
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { QuickAccessTiles } from './homepage/QuickAccessTiles'
import { ProfileSummary } from './homepage/ProfileSummary'
import { WeatherGreeting } from './homepage/WeatherGreeting'
import { TopProxySites } from './homepage/TopProxySites'

interface HomepageProps {
  onNavigate: (url: string) => void
  onSearch: (query: string) => void
}

interface QuickTile {
  id: string
  name: string
  url: string
  icon: string
  category: string
}

const defaultTiles: QuickTile[] = [
  { id: '1', name: 'duckduckgo*', url: 'https://duckduckgo.com', icon: '🦆', category: 'Search' },
  { id: '2', name: 'wikipedia*', url: 'https://wikipedia.org', icon: '📖', category: 'Reference' },
  { id: '3', name: 'github*', url: 'https://github.com', icon: '🐙', category: 'Development' },
  { id: '4', name: 'proton mail*', url: 'https://proton.me', icon: '📧', category: 'Privacy' },
  { id: '5', name: 'signal*', url: 'https://signal.org', icon: '💬', category: 'Privacy' },
  { id: '6', name: 'brave*', url: 'https://search.brave.com', icon: '🦁', category: 'Search' },
  { id: '7', name: 'archive.org*', url: 'https://archive.org', icon: '🏛️', category: 'Reference' },
  { id: '8', name: 'tor*', url: 'https://torproject.org', icon: '🧅', category: 'Privacy' },
  { id: '9', name: 'youtube*', url: 'https://youtube.com', icon: '📺', category: 'Entertainment' },
  { id: '10', name: 'reddit*', url: 'https://reddit.com', icon: '🔴', category: 'Social' },
  { id: '11', name: 'goodnews*', url: 'https://news.ycombinator.com', icon: '🔶', category: 'News' },
  { id: '12', name: 'stackoverflow*', url: 'https://stackoverflow.com', icon: '📚', category: 'Development' },
]

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'good morning*', icon: '🌅' }
  if (hour < 17) return { text: 'good afternoon*', icon: '☀️' }
  if (hour < 21) return { text: 'good evening*', icon: '🌆' }
  return { text: 'Good Night', icon: '🌙' }
}

export const Homepage: React.FC<HomepageProps> = ({ 
  onNavigate, 
  onSearch
}) => {
  const { user } = useAuth()
  const [tiles, setTiles] = useState(defaultTiles)
  const [weather, setWeather] = useState<{ temp: number; condition: string; icon: string } | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const greeting = getTimeBasedGreeting()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const savedTiles = localStorage.getItem('nile-homepage-tiles')
    if (savedTiles) {
      try {
        setTiles(JSON.parse(savedTiles))
      } catch (error) {
        console.error('Error loading saved tiles:', error)
      }
    }

    const mockWeather = {
      temp: 22,
      condition: 'Partly Cloudy',
      icon: '⛅'
    }
    setWeather(mockWeather)
  }, [])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(tiles)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTiles(items)
    localStorage.setItem('nile-homepage-tiles', JSON.stringify(items))
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        <ProfileSummary user={user} currentTime={currentTime} />
        <WeatherGreeting greeting={greeting} weather={weather} />
        <QuickAccessTiles 
          tiles={tiles} 
          onTileClick={onNavigate} 
          onDragEnd={handleDragEnd} 
        />
        <TopProxySites onProxyClick={onNavigate} />
      </div>
    </div>
  )
}
