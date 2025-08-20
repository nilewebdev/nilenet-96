import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Search, Database, Clock, Globe, Trash2, Download, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface IndexedPage {
  id: string
  title: string
  url: string
  content: string
  keywords: string[]
  timestamp: number
  lastVisited: number
  visitCount: number
  category?: string
}

interface SearchIndexingProps {
  onClose: () => void
}

export const SearchIndexing: React.FC<SearchIndexingProps> = ({ onClose }) => {
  const { toast } = useToast()
  const [isIndexingEnabled, setIsIndexingEnabled] = useState(() => {
    return JSON.parse(localStorage.getItem('nile-search-indexing-enabled') || 'true')
  })
  const [indexedPages, setIndexedPages] = useState<IndexedPage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<IndexedPage[]>([])
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexingProgress, setIndexingProgress] = useState(0)
  const [indexSize, setIndexSize] = useState(0)

  useEffect(() => {
    loadIndexedPages()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, indexedPages])

  const loadIndexedPages = () => {
    try {
      const saved = localStorage.getItem('nile-search-index')
      if (saved) {
        const parsed = JSON.parse(saved)
        setIndexedPages(parsed)
        setIndexSize(new Blob([saved]).size)
      }
    } catch (error) {
      console.error('Error loading search index:', error)
    }
  }

  const saveIndexedPages = (pages: IndexedPage[]) => {
    try {
      const data = JSON.stringify(pages)
      localStorage.setItem('nile-search-index', data)
      setIndexSize(new Blob([data]).size)
      setIndexedPages(pages)
    } catch (error) {
      console.error('Error saving search index:', error)
      toast({
        title: "Error",
        description: "Failed to save search index",
        variant: "destructive"
      })
    }
  }

  const toggleIndexing = (enabled: boolean) => {
    setIsIndexingEnabled(enabled)
    localStorage.setItem('nile-search-indexing-enabled', JSON.stringify(enabled))
    toast({
      title: enabled ? "Search indexing enabled" : "Search indexing disabled",
      description: enabled ? "Pages will be indexed for search" : "No new pages will be indexed"
    })
  }

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'a', 'an'].includes(word))
    
    const frequency: { [key: string]: number } = {}
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word)
  }

  const indexPage = async (url: string, title: string, content: string) => {
    if (!isIndexingEnabled) return

    try {
      const keywords = extractKeywords(`${title} ${content}`)
      const existingIndex = indexedPages.findIndex(page => page.url === url)
      
      const newPage: IndexedPage = {
        id: existingIndex >= 0 ? indexedPages[existingIndex].id : Date.now().toString(),
        title: title || url,
        url,
        content: content.substring(0, 5000), // Limit content size
        keywords,
        timestamp: existingIndex >= 0 ? indexedPages[existingIndex].timestamp : Date.now(),
        lastVisited: Date.now(),
        visitCount: existingIndex >= 0 ? indexedPages[existingIndex].visitCount + 1 : 1,
        category: categorizeUrl(url)
      }

      let updatedPages: IndexedPage[]
      if (existingIndex >= 0) {
        updatedPages = [...indexedPages]
        updatedPages[existingIndex] = newPage
      } else {
        updatedPages = [newPage, ...indexedPages.slice(0, 999)] // Keep last 1000 pages
      }

      saveIndexedPages(updatedPages)
    } catch (error) {
      console.error('Error indexing page:', error)
    }
  }

  const categorizeUrl = (url: string): string => {
    const domain = url.toLowerCase()
    if (domain.includes('github.com')) return 'development'
    if (domain.includes('stackoverflow.com') || domain.includes('developer.mozilla.org')) return 'programming'
    if (domain.includes('youtube.com') || domain.includes('vimeo.com')) return 'video'
    if (domain.includes('reddit.com') || domain.includes('twitter.com') || domain.includes('facebook.com')) return 'social'
    if (domain.includes('wikipedia.org') || domain.includes('.edu')) return 'education'
    if (domain.includes('news') || domain.includes('bbc.com') || domain.includes('cnn.com')) return 'news'
    return 'general'
  }

  const performSearch = (query: string) => {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)
    
    const results = indexedPages
      .map(page => {
        let score = 0
        const titleLower = page.title.toLowerCase()
        const urlLower = page.url.toLowerCase()
        const contentLower = page.content.toLowerCase()

        searchTerms.forEach(term => {
          // Title matches get highest score
          if (titleLower.includes(term)) score += 10
          // URL matches get medium score
          if (urlLower.includes(term)) score += 5
          // Keyword matches get good score
          if (page.keywords.some(keyword => keyword.includes(term))) score += 7
          // Content matches get base score
          if (contentLower.includes(term)) score += 1
        })

        // Boost score for recent visits and higher visit count
        score += Math.log(page.visitCount + 1)
        const daysSinceVisit = (Date.now() - page.lastVisited) / (1000 * 60 * 60 * 24)
        score += Math.max(0, 5 - daysSinceVisit)

        return { page, score }
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(result => result.page)

    setSearchResults(results)
  }

  const reindexAllPages = async () => {
    setIsIndexing(true)
    setIndexingProgress(0)

    try {
      // Simulate reindexing process
      const history = JSON.parse(localStorage.getItem('nile-browser-history') || '[]')
      const totalPages = Math.min(history.length, 100) // Limit to 100 most recent pages

      for (let i = 0; i < totalPages; i++) {
        const page = history[i]
        setIndexingProgress((i / totalPages) * 100)
        
        // Simulate indexing delay
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // In a real implementation, we would fetch and analyze page content
        await indexPage(page.url, page.title, `Indexed content for ${page.title}`)
      }

      setIndexingProgress(100)
      toast({
        title: "Indexing complete",
        description: `Indexed ${totalPages} pages successfully`
      })
    } catch (error) {
      console.error('Error during reindexing:', error)
      toast({
        title: "Indexing failed",
        description: "Failed to reindex pages",
        variant: "destructive"
      })
    } finally {
      setIsIndexing(false)
      setIndexingProgress(0)
    }
  }

  const clearIndex = () => {
    localStorage.removeItem('nile-search-index')
    setIndexedPages([])
    setIndexSize(0)
    setSearchResults([])
    toast({
      title: "Index cleared",
      description: "All indexed pages have been removed"
    })
  }

  const exportIndex = () => {
    const data = {
      indexedPages,
      exportDate: new Date().toISOString(),
      version: "1.0"
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nile-search-index-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Index exported",
      description: "Search index has been downloaded"
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="absolute inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Search Indexing</h2>
          <Badge variant="secondary">{indexedPages.length} pages</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Indexed Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search through your indexed pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
            />
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((page) => (
                  <div key={page.id} className="p-3 bg-muted/30 rounded border cursor-pointer hover:bg-muted/50">
                    <div className="font-medium text-sm truncate">{page.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{page.url}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{page.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {page.visitCount} visits • {new Date(page.lastVisited).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Index Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Index Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Enable Search Indexing</div>
                <div className="text-sm text-muted-foreground">
                  Automatically index pages for faster searching
                </div>
              </div>
              <Switch
                checked={isIndexingEnabled}
                onCheckedChange={toggleIndexing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Pages</div>
                <div className="text-muted-foreground">{indexedPages.length.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-medium">Index Size</div>
                <div className="text-muted-foreground">{formatFileSize(indexSize)}</div>
              </div>
            </div>

            {isIndexing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Indexing pages...</span>
                </div>
                <Progress value={indexingProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Index Management */}
        <Card>
          <CardHeader>
            <CardTitle>Index Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={reindexAllPages}
              disabled={isIndexing}
              className="w-full justify-start"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rebuild Index from History
            </Button>

            <Button
              onClick={exportIndex}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Search Index
            </Button>

            <Button
              onClick={clearIndex}
              className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10"
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Indexed Data
            </Button>
          </CardContent>
        </Card>

        {/* Recent Indexed Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recently Indexed Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {indexedPages.slice(0, 10).map((page) => (
                <div key={page.id} className="p-3 bg-muted/30 rounded border">
                  <div className="font-medium text-sm truncate">{page.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{page.url}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{page.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {page.visitCount} visits • {new Date(page.lastVisited).toLocaleDateString()}
                    </span>
                  </div>
                  {page.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {page.keywords.slice(0, 5).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {indexedPages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div>No pages indexed yet</div>
                  <div className="text-xs">Browse some pages to build your search index</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export function to index a page from browser
export const indexPageForSearch = async (url: string, title: string, content: string = '') => {
  const isEnabled = JSON.parse(localStorage.getItem('nile-search-indexing-enabled') || 'true')
  if (!isEnabled) return

  try {
    const existing = JSON.parse(localStorage.getItem('nile-search-index') || '[]')
    const extractKeywords = (text: string): string[] => {
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word))
      
      const frequency: { [key: string]: number } = {}
      words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1
      })

      return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([word]) => word)
    }

    const categorizeUrl = (url: string): string => {
      const domain = url.toLowerCase()
      if (domain.includes('github.com')) return 'development'
      if (domain.includes('stackoverflow.com')) return 'programming'
      if (domain.includes('youtube.com')) return 'video'
      if (domain.includes('reddit.com')) return 'social'
      if (domain.includes('wikipedia.org')) return 'education'
      return 'general'
    }

    const existingIndex = existing.findIndex((page: any) => page.url === url)
    const newPage = {
      id: existingIndex >= 0 ? existing[existingIndex].id : Date.now().toString(),
      title: title || url,
      url,
      content: content.substring(0, 2000),
      keywords: extractKeywords(`${title} ${content}`),
      timestamp: existingIndex >= 0 ? existing[existingIndex].timestamp : Date.now(),
      lastVisited: Date.now(),
      visitCount: existingIndex >= 0 ? existing[existingIndex].visitCount + 1 : 1,
      category: categorizeUrl(url)
    }

    let updatedPages
    if (existingIndex >= 0) {
      updatedPages = [...existing]
      updatedPages[existingIndex] = newPage
    } else {
      updatedPages = [newPage, ...existing.slice(0, 999)]
    }

    localStorage.setItem('nile-search-index', JSON.stringify(updatedPages))
  } catch (error) {
    console.error('Error indexing page:', error)
  }
}