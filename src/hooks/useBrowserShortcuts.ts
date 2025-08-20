import { useEffect } from 'react'

interface BrowserShortcutsProps {
  onNewTab: () => void
  onCloseTab: () => void
  onReload: () => void
  onGoBack: () => void
  onGoForward: () => void
  onFocusSearch: () => void
  onShowAllTabs: () => void
  onShowHistory: () => void
  onShowBookmarks: () => void
  onTogglePrivate: () => void
  onShowSettings: () => void
  onToggleDevTools: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onFindInPage: () => void
  onToggleFullscreen: () => void
}

export const useBrowserShortcuts = (handlers: BrowserShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? event.metaKey : event.ctrlKey
      const altKey = event.altKey
      const shiftKey = event.shiftKey

      // Prevent default browser shortcuts when our app handles them
      if (modKey || altKey) {
        switch (event.key.toLowerCase()) {
          case 't':
            if (modKey && !shiftKey) {
              event.preventDefault()
              handlers.onNewTab()
            }
            break
          
          case 'w':
            if (modKey && !shiftKey) {
              event.preventDefault()
              handlers.onCloseTab()
            }
            break
          
          case 'r':
            if (modKey && !shiftKey) {
              event.preventDefault()
              handlers.onReload()
            }
            break
          
          case 'l':
            if (modKey) {
              event.preventDefault()
              handlers.onFocusSearch()
            }
            break
          
          case 'd':
            if (modKey) {
              event.preventDefault()
              handlers.onShowBookmarks() // Add current page to bookmarks
            }
            break
          
          case 'h':
            if (modKey && !shiftKey) {
              event.preventDefault()
              handlers.onShowHistory()
            }
            break
          
          case 'y':
            if (modKey) {
              event.preventDefault()
              handlers.onShowHistory()
            }
            break
          
          case 'shift':
            if (modKey && event.key === 'Delete') {
              event.preventDefault()
              handlers.onTogglePrivate()
            }
            break
          
          case 'n':
            if (modKey && shiftKey) {
              event.preventDefault()
              handlers.onTogglePrivate()
            }
            break
          
          case ',':
            if (modKey) {
              event.preventDefault()
              handlers.onShowSettings()
            }
            break
          
          case 'i':
            if ((modKey && altKey) || (modKey && shiftKey && event.key === 'I')) {
              event.preventDefault()
              handlers.onToggleDevTools()
            }
            break
          
          case '=':
          case '+':
            if (modKey) {
              event.preventDefault()
              handlers.onZoomIn()
            }
            break
          
          case '-':
            if (modKey) {
              event.preventDefault()
              handlers.onZoomOut()
            }
            break
          
          case '0':
            if (modKey) {
              event.preventDefault()
              handlers.onZoomReset()
            }
            break
          
          case 'f':
            if (modKey) {
              event.preventDefault()
              handlers.onFindInPage()
            }
            break
          
          case 'enter':
            if (altKey) {
              event.preventDefault()
              handlers.onToggleFullscreen()
            }
            break
        }
      }

      // Navigation shortcuts
      if (altKey && !modKey) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault()
            handlers.onGoBack()
            break
          
          case 'ArrowRight':
            event.preventDefault()
            handlers.onGoForward()
            break
        }
      }

      // Tab management
      if (modKey) {
        switch (event.key) {
          case 'ArrowLeft':
            if (shiftKey) {
              event.preventDefault()
              // Previous tab - will be implemented
            }
            break
          
          case 'ArrowRight':
            if (shiftKey) {
              event.preventDefault()
              // Next tab - will be implemented
            }
            break
        }
      }

      // Function keys
      switch (event.key) {
        case 'F5':
          event.preventDefault()
          handlers.onReload()
          break
        
        case 'F11':
          event.preventDefault()
          handlers.onToggleFullscreen()
          break
        
        case 'F12':
          event.preventDefault()
          handlers.onToggleDevTools()
          break
      }

      // Escape key
      if (event.key === 'Escape') {
        // Close any open modals or return to normal view
        // This will be handled by individual components
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlers])
}