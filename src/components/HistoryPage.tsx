import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Search, Clock, Trash2, Calendar } from 'lucide-react'

interface HistoryEntry {
  url: string
  displayUrl: string
  title: string
  timestamp: number
}

interface HistoryPageProps {
  onNavigate: (url: string) => void
  onClose: () => void
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, onClose }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('nile-browser-history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setHistory(parsed)
        setFilteredHistory(parsed)
      } catch (error) {
        console.error('Error loading history:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = history.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.displayUrl.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredHistory(filtered)
    } else {
      setFilteredHistory(history)
    }
  }, [searchQuery, history])

  const clearHistory = () => {
    localStorage.removeItem('nile-browser-history')
    setHistory([])
    setFilteredHistory([])
  }

  const removeEntry = (timestamp: number) => {
    const updated = history.filter(entry => entry.timestamp !== timestamp)
    setHistory(updated)
    setFilteredHistory(updated.filter(entry =>
      !searchQuery.trim() ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.displayUrl.toLowerCase().includes(searchQuery.toLowerCase())
    ))
    localStorage.setItem('nile-browser-history', JSON.stringify(updated))
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString()}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString()}`
    } else {
      return date.toLocaleString()
    }
  }

  return (
    <div className="absolute inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">browsing history*</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            clear all*
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'no matching history found*' : 'no browsing history yet*'}
            </p>
          </div>
        ) : (
          filteredHistory.map((entry) => (
            <Card key={entry.timestamp} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 min-w-0 mr-3"
                    onClick={() => {
                      onNavigate(entry.displayUrl)
                      onClose()
                    }}
                  >
                    <div className="font-medium text-sm truncate mb-1">
                      {entry.title || entry.displayUrl}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mb-1">
                      {entry.displayUrl}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEntry(entry.timestamp)
                    }}
                    className="h-8 w-8 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}