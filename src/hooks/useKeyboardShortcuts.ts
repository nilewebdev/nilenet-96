import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onNewTab?: () => void
  onCloseTab?: () => void
  onReload?: () => void
  onGoBack?: () => void
  onGoForward?: () => void
  onFocusSearch?: () => void
  onShowAllTabs?: () => void
  onShowHistory?: () => void
  onShowBookmarks?: () => void
  onTogglePrivate?: () => void
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, shiftKey, altKey, key } = event
      const isCtrl = ctrlKey || metaKey

      // Prevent default browser shortcuts where needed
      if (isCtrl) {
        switch (key.toLowerCase()) {
          case 't':
            event.preventDefault()
            config.onNewTab?.()
            break
          case 'w':
            if (!shiftKey) {
              event.preventDefault()
              config.onCloseTab?.()
            }
            break
          case 'r':
            event.preventDefault()
            config.onReload?.()
            break
          case 'l':
            event.preventDefault()
            config.onFocusSearch?.()
            break
          case 'h':
            event.preventDefault()
            config.onShowHistory?.()
            break
          case 'd':
            event.preventDefault()
            config.onShowBookmarks?.()
            break
          case 'shift+t':
            if (shiftKey) {
              event.preventDefault()
              config.onTogglePrivate?.()
            }
            break
        }
      }

      // Alt + Arrow keys for navigation
      if (altKey) {
        switch (key) {
          case 'ArrowLeft':
            event.preventDefault()
            config.onGoBack?.()
            break
          case 'ArrowRight':
            event.preventDefault()
            config.onGoForward?.()
            break
        }
      }

      // Function keys
      switch (key) {
        case 'F5':
          event.preventDefault()
          config.onReload?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [config])
}