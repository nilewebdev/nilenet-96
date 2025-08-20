
import React, { useState, useRef, useEffect } from 'react'
import { Search, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  searchQuery: string
  onSearch: (query: string, displayUrl?: string) => void
  onNavigate: (url: string, displayUrl?: string) => void
  canGoBack: boolean
  canGoForward: boolean
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  onPanic: () => void
  isLoading: boolean
  currentUrl: string
}

const searchEngines = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'yahoo', name: 'Yahoo', url: 'https://search.yahoo.com/search?p=' },
  { id: 'startpage', name: 'Startpage', url: 'https://www.startpage.com/sp/search?query=' }
]

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(({
  searchQuery,
  onSearch,
  onNavigate,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  onReload,
  onPanic,
  isLoading,
  currentUrl
}, ref) => {
  const [inputValue, setInputValue] = useState(searchQuery)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setShowSuggestions(false)

    // Handle special commands first
    const trimmedInput = inputValue.trim()
    if (trimmedInput === '//versions' || trimmedInput === '//version' || trimmedInput === '//about') {
      onSearch('//versions', 'Versions')
      return
    }
    
    if (trimmedInput === '//search-engine' || trimmedInput === '//engine') {
      onSearch('//engine', 'Search Engine Info')
      return
    }

    if (isUrl(inputValue)) {
      const finalUrl = inputValue.startsWith('http') ? inputValue : `https://${inputValue}`
      onSearch(finalUrl, inputValue)
    } else {
      const searchUrl = getSearchUrl(inputValue)
      onSearch(searchUrl, `Search: ${inputValue}`)
    }
  }

  const generateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const commonSuggestions = [
      'google.com',
      'youtube.com',
      'wikipedia.org',
      'github.com',
      'stackoverflow.com',
      'reddit.com',
      'twitter.com',
      'facebook.com'
    ]

    const filtered = commonSuggestions
      .filter(site => site.includes(query.toLowerCase()))
      .slice(0, 5)

    setSuggestions(filtered)
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    setShowSuggestions(false)
    const finalUrl = suggestion.startsWith('http') ? suggestion : `https://${suggestion}`
    onSearch(finalUrl, suggestion)
  }

  const getPlaceholderText = () => {
    const defaultEngine = localStorage.getItem('nile-default-search-engine') || 'bing'
    const engine = searchEngines.find(e => e.id === defaultEngine) || searchEngines[1]
    return `Search with ${engine.name} or enter URL...`
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-background border-b border-border relative">
      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          disabled={!canGoBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoForward}
          disabled={!canGoForward}
          className="h-8 w-8 p-0"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReload}
          className="h-8 w-8 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <div className="relative">
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
            placeholder={getPlaceholderText()}
            className="pr-10"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-muted text-sm flex items-center gap-2"
              >
                <Search className="h-3 w-3 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Panic Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPanic}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        title="Panic - Close all tabs"
      >
        <AlertTriangle className="h-4 w-4" />
      </Button>
    </div>
  )
})
