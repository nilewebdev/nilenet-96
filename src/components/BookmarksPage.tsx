import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { X, Search, Bookmark, Trash2, Star, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface BookmarkEntry {
  id: string
  title: string
  url: string
  timestamp: number
  folder?: string
}

interface BookmarksPageProps {
  onNavigate: (url: string) => void
  onClose: () => void
  currentUrl?: string
  currentTitle?: string
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ 
  onNavigate, 
  onClose, 
  currentUrl, 
  currentTitle 
}) => {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkEntry[]>([])
  const [newBookmark, setNewBookmark] = useState({ title: currentTitle || '', url: currentUrl || '' })
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('nile-bookmarks')
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks)
        setBookmarks(parsed)
        setFilteredBookmarks(parsed)
      } catch (error) {
        console.error('Error loading bookmarks:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = bookmarks.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredBookmarks(filtered)
    } else {
      setFilteredBookmarks(bookmarks)
    }
  }, [searchQuery, bookmarks])

  const addBookmark = () => {
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) return

    const bookmark: BookmarkEntry = {
      id: Date.now().toString(),
      title: newBookmark.title.trim(),
      url: newBookmark.url.trim(),
      timestamp: Date.now()
    }

    const updated = [bookmark, ...bookmarks]
    setBookmarks(updated)
    setFilteredBookmarks(updated)
    localStorage.setItem('nile-bookmarks', JSON.stringify(updated))
    
    setNewBookmark({ title: '', url: '' })
    setShowAddDialog(false)
  }

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(bookmark => bookmark.id !== id)
    setBookmarks(updated)
    setFilteredBookmarks(updated.filter(bookmark =>
      !searchQuery.trim() ||
      bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
    ))
    localStorage.setItem('nile-bookmarks', JSON.stringify(updated))
  }

  const isCurrentPageBookmarked = () => {
    return currentUrl && bookmarks.some(bookmark => bookmark.url === currentUrl)
  }

  const toggleCurrentPageBookmark = () => {
    if (!currentUrl) return

    if (isCurrentPageBookmarked()) {
      const bookmark = bookmarks.find(b => b.url === currentUrl)
      if (bookmark) removeBookmark(bookmark.id)
    } else {
      const bookmark: BookmarkEntry = {
        id: Date.now().toString(),
        title: currentTitle || currentUrl,
        url: currentUrl,
        timestamp: Date.now()
      }
      const updated = [bookmark, ...bookmarks]
      setBookmarks(updated)
      setFilteredBookmarks(updated)
      localStorage.setItem('nile-bookmarks', JSON.stringify(updated))
    }
  }

  return (
    <div className="absolute inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">bookmarks*</h2>
        </div>
        <div className="flex items-center gap-2">
          {currentUrl && (
            <Button 
              variant={isCurrentPageBookmarked() ? "default" : "outline"} 
              size="sm" 
              onClick={toggleCurrentPageBookmark}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              {isCurrentPageBookmarked() ? 'Bookmarked' : 'Bookmark'}
            </Button>
          )}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bookmark</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newBookmark.title}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bookmark title"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newBookmark.url}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <Button onClick={addBookmark} className="w-full">
                  Add Bookmark
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 border-b">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No matching bookmarks found' : 'No bookmarks yet'}
            </p>
          </div>
        ) : (
          filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 min-w-0 mr-3"
                    onClick={() => {
                      onNavigate(bookmark.url)
                      onClose()
                    }}
                  >
                    <div className="font-medium text-sm truncate mb-1">
                      {bookmark.title}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {bookmark.url}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeBookmark(bookmark.id)
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