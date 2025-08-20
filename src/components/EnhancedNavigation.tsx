import React, { useState, useRef, useEffect } from 'react'
import { Search, ArrowLeft, ArrowRight, RotateCcw, Home, Bookmark, History as HistoryIcon, Star, Globe, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface EnhancedNavigationProps {
  searchQuery: string
  onSearch: (query: string, displayUrl?: string) => void
  onNavigate: (url: string, displayUrl?: string) => void
  canGoBack: boolean
  canGoForward: boolean
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onHome: () => void
  onBookmark: () => void
  onHistory: () => void
  isLoading: boolean
  currentUrl: string
  isBookmarked?: boolean
}

interface Suggestion {
  type: 'url' | 'search' | 'bookmark' | 'history'
  text: string
  url: string
  icon: React.ReactNode
  subtitle?: string
}

const searchEngines = [
  { id: 'google', name: 'google*', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'bing*', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'duckduckgo*', url: 'https://duckduckgo.com/?q=' },
  { id: 'yahoo', name: 'yahoo*', url: 'https://search.yahoo.com/search?p=' },
  { id: 'startpage', name: 'startpage*', url: 'https://www.startpage.com/sp/search?query=' }
]

export const EnhancedNavigation = React.forwardRef<HTMLInputElement, EnhancedNavigationProps>(({
  searchQuery,
  onSearch,
  onNavigate,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onReload,
  onHome,
  onBookmark,
  onHistory,
  isLoading,
  currentUrl,
  isBookmarked = false
}, ref) => {
  const [inputValue, setInputValue] = useState(searchQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSecure, setIsSecure] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(searchQuery)
    setIsSecure(currentUrl.startsWith('https://'))
  }, [searchQuery, currentUrl])

  const isUrl = (text: string) => {
    try {
      new URL(text.startsWith('http') ? text : `https://${text}`)
      return text.includes('.') && !text.includes(' ')
    } catch {
      return false
    }
  }

  const getSearchUrl = (query: string) => {
    const defaultEngine = localStorage.getItem('nile-default-search-engine') || 'bing'
    const engine = searchEngines.find(e => e.id === defaultEngine) || searchEngines[1]
    return engine.url + encodeURIComponent(query)
  }

  const generateSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const suggestions: Suggestion[] = []

    // URL suggestions
    if (isUrl(query)) {
      suggestions.push({
        type: 'url',
        text: query,
        url: query.startsWith('http') ? query : `https://${query}`,
        icon: <Globe className="h-4 w-4" />,
        subtitle: 'navigate to website*'
      })
    }

    // Search suggestions
    const defaultEngine = localStorage.getItem('nile-default-search-engine') || 'bing'
    const engine = searchEngines.find(e => e.id === defaultEngine) || searchEngines[1]
    
    suggestions.push({
      type: 'search',
      text: `search ${engine.name.replace('*', '')} for "${query}"*`,
      url: getSearchUrl(query),
      icon: <Search className="h-4 w-4" />,
      subtitle: `using ${engine.name}`
    })

    // Bookmark suggestions
    try {
      const bookmarks = JSON.parse(localStorage.getItem('nile-bookmarks') || '[]')
      const matchingBookmarks = bookmarks
        .filter((bookmark: any) => 
          bookmark.name.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.url.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)

      matchingBookmarks.forEach((bookmark: any) => {
        suggestions.push({
          type: 'bookmark',
          text: bookmark.name,
          url: bookmark.url,
          icon: <Star className="h-4 w-4 text-yellow-500" />,
          subtitle: 'from bookmarks*'
        })
      })
    } catch (error) {
      console.error('Error loading bookmarks for suggestions:', error)
    }

    // History suggestions
    try {
      const history = JSON.parse(localStorage.getItem('nile-browser-history') || '[]')
      const matchingHistory = history
        .filter((entry: any) => 
          entry.title.toLowerCase().includes(query.toLowerCase()) ||
          entry.displayUrl.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)

      matchingHistory.forEach((entry: any) => {
        suggestions.push({
          type: 'history',
          text: entry.title,
          url: entry.url,
          icon: <HistoryIcon className="h-4 w-4 text-muted-foreground" />,
          subtitle: 'from history*'
        })
      })
    } catch (error) {
      console.error('Error loading history for suggestions:', error)
    }

    setSuggestions(suggestions.slice(0, 8))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setShowSuggestions(false)

    if (isUrl(inputValue)) {
      const finalUrl = inputValue.startsWith('http') ? inputValue : `https://${inputValue}`
      onSearch(finalUrl, inputValue)
    } else {
      const searchUrl = getSearchUrl(inputValue)
      onSearch(searchUrl, `search: ${inputValue}*`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value.trim()) {
      generateSuggestions(value)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInputValue(suggestion.url)
    setShowSuggestions(false)
    onSearch(suggestion.url, suggestion.text)
  }

  const getSecurityBadge = () => {
    if (!currentUrl || currentUrl === '') return null
    
    if (isSecure) {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <Shield className="h-3 w-3 mr-1" />
          secure*
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive" className="text-xs">
          not secure*
        </Badge>
      )
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-background border-b border-border">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          disabled={!canGoBack}
          className="h-8 w-8 p-0"
          title="go back*"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoForward}
          disabled={!canGoForward}
          className="h-8 w-8 p-0"
          title="go forward*"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReload}
          className="h-8 w-8 p-0"
          title="reload*"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHome}
          className="h-8 w-8 p-0"
          title="home*"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* Enhanced Address Bar */}
      <div className="flex-1 relative">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">
            <Input
              ref={ref || inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => {
                if (inputValue.trim()) {
                  generateSuggestions(inputValue)
                  setShowSuggestions(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 150)
              }}
              placeholder="search or enter url*"
              className="pr-24 pl-4"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {getSecurityBadge()}
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Enhanced Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-1 shadow-lg z-50 border">
              <CardContent className="p-0">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-muted text-sm flex items-center gap-3 border-b last:border-b-0"
                  >
                    {suggestion.icon}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.text}</div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBookmark}
          className={`h-8 w-8 p-0 ${isBookmarked ? 'text-yellow-500' : ''}`}
          title={isBookmarked ? 'remove bookmark*' : 'add bookmark*'}
        >
          <Star className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onHistory}
          className="h-8 w-8 p-0"
          title="history*"
        >
          <HistoryIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})