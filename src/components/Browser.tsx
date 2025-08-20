import React, { useState, useRef, useEffect } from 'react'
import { SearchBar } from './SearchBar'
import { TabBar } from './TabBar'
import { BrowserView } from './BrowserView'
import { AllTabsView } from './AllTabsView'
import { Homepage } from './Homepage'
import { MainFooter } from './MainFooter'
import { DownloadsPage } from './DownloadsPage'
import { Onboarding } from './Onboarding'
import { VersionsPage } from './VersionsPage'
import { SearchEngineInfo } from './SearchEngineInfo'
import { HistoryPage } from './HistoryPage'
import { BookmarksPage } from './BookmarksPage'
import { PrivateModeToggle } from './PrivateModeToggle'
import { AddToHomeScreen } from './AddToHomeScreen'
import { DonationPrompt } from './DonationPrompt'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useBrowserShortcuts } from '@/hooks/useBrowserShortcuts'
import { BrowserMigration } from './BrowserMigration'
import { ProtocolHandler } from './ProtocolHandler'
import { EnhancedNavigation } from './EnhancedNavigation'
import { SearchIndexing, indexPageForSearch } from './SearchIndexing'

interface BrowserProps {
  onOpenProfile: () => void
  onOpenSettings: () => void
}

interface Tab {
  id: string
  title: string
  url: string
  displayUrl: string // The original URL to display in UI
  favicon?: string
  isLoading?: boolean
  isActive: boolean
}

interface HistoryEntry {
  url: string
  displayUrl: string
  title: string
  timestamp: number
}

export const Browser: React.FC<BrowserProps> = ({ onOpenProfile, onOpenSettings }) => {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [privateTabs, setPrivateTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [currentView, setCurrentView] = useState<'browser' | 'alltabs' | 'home' | 'versions' | 'search-engine-info' | 'history' | 'bookmarks' | 'search-indexing'>('home')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [currentDisplayUrl, setCurrentDisplayUrl] = useState('')
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showMigration, setShowMigration] = useState(false)
  const [showProtocolHandler, setShowProtocolHandler] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const historyRef = useRef<{url: string, displayUrl: string}[]>([])
  const historyIndexRef = useRef(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Clear all mobile app data for fresh start
    const clearMobileData = () => {
      try {
        // Clear localStorage except theme, onboarding status, bookmarks, and history
        const keysToKeep = [
          'theme', 
          'nile-onboarding-completed', 
          'nile-bookmarks', 
          'nile-browser-history',
          'nile-tabs',
          'nile-private-tabs'
        ]
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        // Set default proxy to off for first time setup
        localStorage.setItem('nile-proxy-enabled', 'false')
        localStorage.setItem('nile-default-search-engine', 'bing')
        
        console.log('Mobile data cleared successfully')
      } catch (error) {
        console.error('Error clearing mobile data:', error)
      }
    }
    
    // Only clear data if not already cleared
    const dataCleared = localStorage.getItem('nile-data-cleared')
    if (!dataCleared) {
      clearMobileData()
      localStorage.setItem('nile-data-cleared', 'true')
    }
    
    // Check if mobile/tablet and show add to home screen instead of onboarding
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const onboardingCompleted = localStorage.getItem('nile-onboarding-completed')
    const addToHomeShown = localStorage.getItem('nile-add-to-home-shown')
    
    if (isMobile && addToHomeShown !== 'true' && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowOnboarding(true) // We'll repurpose this for mobile add to home screen
    }

    // Restore tabs from localStorage
    const savedTabs = localStorage.getItem('nile-tabs')
    const savedPrivateTabs = localStorage.getItem('nile-private-tabs')
    
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs)
        if (parsed.length > 0) {
          setTabs(parsed)
          const activeTab = parsed.find((tab: Tab) => tab.isActive) || parsed[0]
          setActiveTabId(activeTab.id)
        } else {
          createInitialTab()
        }
      } catch (error) {
        console.error('Error loading saved tabs:', error)
        createInitialTab()
      }
    } else {
      createInitialTab()
    }

    if (savedPrivateTabs) {
      try {
        const parsed = JSON.parse(savedPrivateTabs)
        setPrivateTabs(parsed)
      } catch (error) {
        console.error('Error loading saved private tabs:', error)
      }
    }
  }, [])

  const createInitialTab = () => {
    const initialTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: '',
      displayUrl: '',
      isActive: true
    }
    setTabs([initialTab])
    setActiveTabId(initialTab.id)
  }

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem('nile-tabs', JSON.stringify(tabs))
    }
  }, [tabs])

  useEffect(() => {
    localStorage.setItem('nile-private-tabs', JSON.stringify(privateTabs))
  }, [privateTabs])

  const getProxyUrl = (url: string): string => {
    const isProxyEnabled = JSON.parse(localStorage.getItem('nile-proxy-enabled') || 'false')
    
    if (!isProxyEnabled || !url || url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
      return url
    }
    
    // Use HideMyName proxy service
    const proxyBaseUrl = 'https://www.hidemyname-freeproxy.com/includes/process.php?action=update'
    const encodedUrl = encodeURIComponent(url)
    return `${proxyBaseUrl}&u=${encodedUrl}&b=12`
  }

  const addToHistory = (url: string, displayUrl: string, title: string = '') => {
    if (historyIndexRef.current >= 0 && historyRef.current[historyIndexRef.current]?.url === url) {
      return
    }

    historyIndexRef.current += 1
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current)
    historyRef.current.push({ url, displayUrl })
    
    // Add to browsing history
    const newHistoryEntry: HistoryEntry = {
      url,
      displayUrl,
      title: title || displayUrl,
      timestamp: Date.now()
    }
    
    setHistory(prevHistory => {
      const updatedHistory = [newHistoryEntry, ...prevHistory.slice(0, 999)] // Keep last 1000 entries
      localStorage.setItem('nile-browser-history', JSON.stringify(updatedHistory))
      return updatedHistory
    })
    
    setCanGoBack(historyIndexRef.current > 0)
    setCanGoForward(false)
  }

  const handleGoBack = () => {
    if (canGoBack && historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      const historyItem = historyRef.current[historyIndexRef.current]
      setCurrentUrl(historyItem.url)
      setCurrentDisplayUrl(historyItem.displayUrl)
      setSearchQuery(historyItem.displayUrl)
      setCanGoBack(historyIndexRef.current > 0)
      setCanGoForward(true)
    }
  }

  const handleGoForward = () => {
    if (canGoForward && historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      const historyItem = historyRef.current[historyIndexRef.current]
      setCurrentUrl(historyItem.url)
      setCurrentDisplayUrl(historyItem.displayUrl)
      setSearchQuery(historyItem.displayUrl)
      setCanGoForward(historyIndexRef.current < historyRef.current.length - 1)
      setCanGoBack(true)
    }
  }

  const handleReload = () => {
    if (currentUrl) {
      const reloadUrl = currentUrl + (currentUrl.includes('?') ? '&' : '?') + '_reload=' + Date.now()
      setCurrentUrl(reloadUrl)
    }
  }

  const handlePanic = () => {
    setTabs([])
    setActiveTabId(null)
    setCurrentUrl('')
    setCurrentDisplayUrl('')
    setSearchQuery('')
    historyRef.current = []
    historyIndexRef.current = -1
    setCanGoBack(false)
    setCanGoForward(false)
    setCurrentView('home')
  }

  const handleSearch = (query: string, displayUrl?: string) => {
    console.log('Search initiated:', query)
    
    // Handle special commands
    if (query === '//versions' || query === '//version' || query === '//about') {
      setCurrentView('versions')
      return
    }
    
    if (query === '//search-engine' || query === '//engine') {
      setCurrentView('search-engine-info')
      return
    }
    
    const finalDisplayUrl = displayUrl || query
    const proxiedUrl = getProxyUrl(query)
    
    setSearchQuery(finalDisplayUrl)
    setCurrentUrl(proxiedUrl)
    setCurrentDisplayUrl(finalDisplayUrl)
    addToHistory(proxiedUrl, finalDisplayUrl)
    setCurrentView('browser')
    
    // Update the active tab with the new URL
    if (activeTabId) {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, url: proxiedUrl, displayUrl: finalDisplayUrl, title: finalDisplayUrl }
            : tab
        )
      )
    }
    
    console.log('Current view set to browser, URL:', proxiedUrl)
  }

  const handleNavigate = (url: string, displayUrl?: string) => {
    console.log('Navigating to:', url)
    
    const finalDisplayUrl = displayUrl || url
    const proxiedUrl = getProxyUrl(url)
    
    setCurrentUrl(proxiedUrl)
    setCurrentDisplayUrl(finalDisplayUrl)
    setSearchQuery(finalDisplayUrl)
    addToHistory(proxiedUrl, finalDisplayUrl)
    setCurrentView('browser')
    
    // Update the active tab with the new URL
    if (activeTabId) {
      setTabs(prevTabs => 
        prevTabs.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, url: proxiedUrl, displayUrl: finalDisplayUrl, title: finalDisplayUrl }
            : tab
        )
      )
    }
    
    console.log('Navigation complete, view:', 'browser', 'URL:', proxiedUrl)
  }

  const handleShowHome = () => {
    setCurrentView('home')
  }

  const handleShowAllTabs = () => {
    setCurrentView('alltabs')
  }

  const handleCloseAllTabs = () => {
    setCurrentView('home')
  }

  const handleShowHistory = () => {
    setCurrentView('history')
  }

  const handleShowBookmarks = () => {
    setCurrentView('bookmarks')
  }

  const handleShowSearchIndexing = () => {
    setCurrentView('search-indexing')
  }

  const togglePrivateMode = () => {
    setIsPrivateMode(!isPrivateMode)
    // Switch to appropriate tab set
    if (!isPrivateMode) {
      // Switching to private mode
      if (privateTabs.length > 0) {
        const activePrivateTab = privateTabs.find(tab => tab.isActive) || privateTabs[0]
        setActiveTabId(activePrivateTab.id)
      } else {
        // Create new private tab
        const newPrivateTab: Tab = {
          id: Date.now().toString(),
          title: 'Private Tab',
          url: '',
          displayUrl: '',
          isActive: true
        }
        setPrivateTabs([newPrivateTab])
        setActiveTabId(newPrivateTab.id)
        setCurrentView('home')
      }
    } else {
      // Switching to normal mode
      if (tabs.length > 0) {
        const activeTab = tabs.find(tab => tab.isActive) || tabs[0]
        setActiveTabId(activeTab.id)
      }
    }
  }

  const getCurrentTabs = () => isPrivateMode ? privateTabs : tabs
  const setCurrentTabs = (updater: (tabs: Tab[]) => Tab[]) => {
    if (isPrivateMode) {
      setPrivateTabs(updater)
    } else {
      setTabs(updater)
    }
  }

  const handleTabSelect = (tabId: string) => {
    console.log('Tab selected:', tabId)
    const currentTabs = getCurrentTabs()
    const selectedTab = currentTabs.find(tab => tab.id === tabId)
    if (selectedTab) {
      setActiveTabId(tabId)
      
      // Update tab active states
      setCurrentTabs(prevTabs => 
        prevTabs.map(tab => ({
          ...tab,
          isActive: tab.id === tabId
        }))
      )
      
      // If tab has content, show browser view and reload the URL
      if (selectedTab.url && selectedTab.url.trim() !== '') {
        // Force reload the URL by adding a timestamp parameter
        const reloadUrl = selectedTab.url + (selectedTab.url.includes('?') ? '&' : '?') + '_reload=' + Date.now()
        setCurrentUrl(reloadUrl)
        setCurrentDisplayUrl(selectedTab.displayUrl)
        setSearchQuery(selectedTab.displayUrl)
        setCurrentView('browser')
        console.log('Switching to browser view for tab with URL:', reloadUrl)
      } else {
        setCurrentUrl('')
        setCurrentDisplayUrl('')
        setSearchQuery('')
        setCurrentView('home')
        console.log('Switching to home view for empty tab')
      }
    }
  }

  // Enhanced keyboard shortcuts for full browser functionality
  useBrowserShortcuts({
    onNewTab: () => {
      const newTab: Tab = {
        id: Date.now().toString(),
        title: isPrivateMode ? 'private tab*' : 'new tab*',
        url: '',
        displayUrl: '',
        isActive: true
      }
      setCurrentTabs(prevTabs => [
        ...prevTabs.map(tab => ({ ...tab, isActive: false })),
        newTab
      ])
      setActiveTabId(newTab.id)
      setCurrentView('home')
    },
    onCloseTab: () => {
      if (activeTabId) {
        const currentTabs = getCurrentTabs()
        const updatedTabs = currentTabs.filter(tab => tab.id !== activeTabId)
        if (updatedTabs.length > 0) {
          setCurrentTabs(() => updatedTabs)
          const newActiveTab = updatedTabs[0]
          handleTabSelect(newActiveTab.id)
        } else {
          setCurrentTabs(() => [])
          setActiveTabId(null)
          setCurrentView('home')
        }
      }
    },
    onReload: handleReload,
    onGoBack: handleGoBack,
    onGoForward: handleGoForward,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onShowAllTabs: handleShowAllTabs,
    onShowHistory: handleShowHistory,
    onShowBookmarks: handleShowBookmarks,
    onTogglePrivate: togglePrivateMode,
    onShowSettings: onOpenSettings,
    onToggleDevTools: () => {
      // Will be implemented with Tauri
      console.log('toggle dev tools*')
    },
    onZoomIn: () => {
      // Will be implemented with Tauri
      console.log('zoom in*')
    },
    onZoomOut: () => {
      // Will be implemented with Tauri  
      console.log('zoom out*')
    },
    onZoomReset: () => {
      // Will be implemented with Tauri
      console.log('reset zoom*')
    },
    onFindInPage: () => {
      // Will be implemented with Tauri
      console.log('find in page*')
    },
    onToggleFullscreen: () => {
      // Will be implemented with Tauri
      console.log('toggle fullscreen*')
    }
  })

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  if (showOnboarding) {
    if (isMobile && !window.matchMedia('(display-mode: standalone)').matches) {
      return (
        <AddToHomeScreen 
          onDismiss={() => {
            setShowOnboarding(false)
            localStorage.setItem('nile-add-to-home-shown', 'true')
          }} 
        />
      )
    } else {
      // For desktop, just dismiss immediately
      setShowOnboarding(false)
      return null
    }
  }

  console.log('Current view:', currentView, 'Current URL:', currentUrl)

  const handleBookmarkToggle = () => {
    const bookmarks = JSON.parse(localStorage.getItem('nile-bookmarks') || '[]')
    const isCurrentlyBookmarked = bookmarks.some((b: any) => b.url === currentDisplayUrl)
    
    if (isCurrentlyBookmarked) {
      const updatedBookmarks = bookmarks.filter((b: any) => b.url !== currentDisplayUrl)
      localStorage.setItem('nile-bookmarks', JSON.stringify(updatedBookmarks))
    } else {
      const newBookmark = {
        name: getCurrentTabs().find(tab => tab.id === activeTabId)?.title || currentDisplayUrl,
        url: currentDisplayUrl,
        folder: 'general*'
      }
      localStorage.setItem('nile-bookmarks', JSON.stringify([...bookmarks, newBookmark]))
    }
  }

  const isBookmarked = () => {
    const bookmarks = JSON.parse(localStorage.getItem('nile-bookmarks') || '[]')
    return bookmarks.some((b: any) => b.url === currentDisplayUrl)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {showMigration && (
        <BrowserMigration 
          onClose={() => setShowMigration(false)}
          onComplete={() => {
            setShowMigration(false)
            handleShowHome()
          }}
        />
      )}
      
      {showProtocolHandler && (
        <ProtocolHandler onClose={() => setShowProtocolHandler(false)} />
      )}

      <div className="flex items-center gap-2 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex-1">
          <EnhancedNavigation
            ref={searchInputRef}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onNavigate={handleNavigate}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onGoBack={handleGoBack}
            onGoForward={handleGoForward}
            onReload={handleReload}
            onHome={handleShowHome}
            onBookmark={handleBookmarkToggle}
            onHistory={handleShowHistory}
            isLoading={isLoading}
            currentUrl={currentDisplayUrl}
            isBookmarked={isBookmarked()}
          />
        </div>
        <PrivateModeToggle 
          isPrivate={isPrivateMode} 
          onToggle={togglePrivateMode}
        />
      </div>
      
      {getCurrentTabs().length > 0 && (
        <TabBar
          tabs={getCurrentTabs()}
          activeTabId={activeTabId}
          onTabSelect={handleTabSelect}
          onTabClose={(tabId) => {
            const currentTabs = getCurrentTabs()
            const updatedTabs = currentTabs.filter(tab => tab.id !== tabId)
            setCurrentTabs(() => updatedTabs)
            if (activeTabId === tabId) {
              if (updatedTabs.length > 0) {
                handleTabSelect(updatedTabs[0].id)
              } else {
                setActiveTabId(null)
                setCurrentView('home')
              }
            }
          }}
          onNewTab={() => {
            const newTab: Tab = {
              id: Date.now().toString(),
              title: isPrivateMode ? 'Private Tab' : 'New Tab',
              url: '',
              displayUrl: '',
              isActive: true
            }
            setCurrentTabs(prevTabs => [
              ...prevTabs.map(tab => ({ ...tab, isActive: false })),
              newTab
            ])
            setActiveTabId(newTab.id)
            setCurrentView('home')
          }}
        />
      )}

      <div className="flex-1 flex flex-col min-h-0 relative">
        {currentView === 'home' && (
          <Homepage 
            onNavigate={handleNavigate} 
            onSearch={handleSearch}
          />
        )}
        
        {currentView === 'versions' && (
          <VersionsPage />
        )}
        
        {currentView === 'search-engine-info' && (
          <SearchEngineInfo />
        )}
        
        {currentView === 'browser' && currentUrl && (
          <BrowserView
            ref={iframeRef}
            url={currentUrl}
            isActive={true}
            onTitleChange={(title) => {
              console.log('Title changed:', title)
              const currentTabs = getCurrentTabs()
              if (activeTabId && currentTabs.length > 0) {
                setCurrentTabs(prevTabs => 
                  prevTabs.map(tab => 
                    tab.id === activeTabId ? { ...tab, title } : tab
                  )
                )
                // Update history with title (don't save private browsing history)
                if (!isPrivateMode) {
                  addToHistory(currentUrl, currentDisplayUrl, title)
                  // Index the page for search
                  indexPageForSearch(currentDisplayUrl, title, '')
                }
              } else if (currentTabs.length === 0 && currentDisplayUrl) {
                // Create a new tab if none exists
                const newTab: Tab = {
                  id: Date.now().toString(),
                  title: title || currentDisplayUrl,
                  url: currentUrl,
                  displayUrl: currentDisplayUrl,
                  isActive: true
                }
                setCurrentTabs(() => [newTab])
                setActiveTabId(newTab.id)
              }
            }}
            onLoadStart={() => {
              console.log('Load started')
              setIsLoading(true)
            }}
            onLoadEnd={() => {
              console.log('Load ended')
              setIsLoading(false)
            }}
          />
        )}
        
        {currentView === 'history' && (
          <HistoryPage 
            onNavigate={handleNavigate}
            onClose={() => setCurrentView('home')}
          />
        )}
        
        {currentView === 'bookmarks' && (
          <BookmarksPage 
            onNavigate={handleNavigate}
            onClose={() => setCurrentView('home')}
            currentUrl={currentDisplayUrl}
            currentTitle={getCurrentTabs().find(tab => tab.id === activeTabId)?.title}
          />
        )}
        
        {currentView === 'alltabs' && (
          <AllTabsView
            tabs={getCurrentTabs()}
            privateTabs={privateTabs}
            isPrivateMode={isPrivateMode}
            onSelectTab={handleTabSelect}
            onSearch={handleSearch}
            onCloseTab={(tabId) => {
              const currentTabs = getCurrentTabs()
              const updatedTabs = currentTabs.filter(tab => tab.id !== tabId)
              setCurrentTabs(() => updatedTabs)
              if (activeTabId === tabId) {
                if (updatedTabs.length > 0) {
                  handleTabSelect(updatedTabs[0].id)
                } else {
                  setActiveTabId(null)
                  setCurrentView('home')
                }
              }
            }}
            onClose={handleCloseAllTabs}
            onNewTab={() => {
              const newTab: Tab = {
                id: Date.now().toString(),
                title: isPrivateMode ? 'Private Tab' : 'New Tab',
                url: '',
                displayUrl: '',
                isActive: true
              }
              setCurrentTabs(prevTabs => [
                ...prevTabs.map(tab => ({ ...tab, isActive: false })),
                newTab
              ])
              setActiveTabId(newTab.id)
              setCurrentView('home')
            }}
          />
        )}

        {currentView === 'search-indexing' && (
          <SearchIndexing 
            onClose={() => setCurrentView('home')}
          />
        )}
      </div>

      <MainFooter
        onOpenProfile={() => {
          setShowMigration(false)
          setShowProtocolHandler(false)
          onOpenProfile()
        }}
        onOpenSettings={() => {
          setShowMigration(false)
          setShowProtocolHandler(false)
          onOpenSettings()
        }}
        onShowHome={handleShowHome}
        onShowAllTabs={handleShowAllTabs}
        onShowHistory={handleShowHistory}
        onShowBookmarks={handleShowBookmarks}
        onShowSearchIndexing={handleShowSearchIndexing}
      />
    </div>
  )
}
