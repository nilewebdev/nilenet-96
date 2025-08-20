import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Trash2, Download, Shield, Palette, X, History, Heart, Info, Sun, Moon, Monitor, Globe, Search, FileDown, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from './LoginModal'
import { NativeConfirmDialog } from './NativeConfirmDialog'
import { toast } from '@/hooks/use-toast'

interface SettingsProps {
  onClose: () => void
  onOpenProfile: () => void
  onShowMigration?: () => void
  onShowProtocolHandler?: () => void
}

interface HistoryEntry {
  url: string
  displayUrl: string
  title: string
  timestamp: number
}

const searchEngines = [
  { id: 'google', name: 'google*', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'bing*', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'duckduckgo*', url: 'https://duckduckgo.com/?q=' },
  { id: 'yahoo', name: 'yahoo*', url: 'https://search.yahoo.com/search?p=' },
  { id: 'startpage', name: 'startpage*', url: 'https://www.startpage.com/sp/search?query=' }
]

export const Settings: React.FC<SettingsProps> = ({ onClose, onOpenProfile, onShowMigration, onShowProtocolHandler }) => {
  const { user } = useAuth()
  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [adBlockEnabled, setAdBlockEnabled] = useState(true)
  const [trackingProtection, setTrackingProtection] = useState(true)
  const [proxyEnabled, setProxyEnabled] = useState(() => {
    const saved = localStorage.getItem('nile-proxy-enabled')
    return saved ? JSON.parse(saved) : false
  })
  const [defaultSearchEngine, setDefaultSearchEngine] = useState(() => {
    return localStorage.getItem('nile-default-search-engine') || 'bing'
  })
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const savedHistory = localStorage.getItem('nile-browser-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error loading history:', error)
      }
    }
  }, [])

  const handleProxyToggle = (enabled: boolean) => {
    setProxyEnabled(enabled)
    localStorage.setItem('nile-proxy-enabled', JSON.stringify(enabled))
    toast({
      title: "proxy settings updated*",
      description: `proxy ${enabled ? 'enabled' : 'disabled'}* refresh tabs to apply changes*`,
    })
  }

  const handleSearchEngineChange = (engineId: string) => {
    setDefaultSearchEngine(engineId)
    localStorage.setItem('nile-default-search-engine', engineId)
    const engineName = searchEngines.find(e => e.id === engineId)?.name || 'google*'
    toast({
      title: "search engine updated*",
      description: `default search engine changed to ${engineName}*`,
    })
  }

  const handleClearAllData = async () => {
    setIsClearing(true)
    
    try {
      const keysToKeep = ['theme']
      const allKeys = Object.keys(localStorage)
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
      
      sessionStorage.clear()
      
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases()
          const deletePromises = databases.map(db => {
            if (db.name) {
              return new Promise<void>((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!)
                deleteReq.onsuccess = () => resolve()
                deleteReq.onerror = () => resolve()
                deleteReq.onblocked = () => resolve()
              })
            }
            return Promise.resolve()
          })
          
          await Promise.all(deletePromises)
        } catch (error) {
          console.error('Error clearing IndexedDB:', error)
        }
      }
      
      toast({
        title: "data cleared*",
        description: "all browsing data has been successfully cleared*",
      })
      
      setHistory([])
      setShowClearDataDialog(false)
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error) {
      console.error('Error clearing data:', error)
      toast({
        title: "error*",
        description: "failed to clear all data* please try again*",
        variant: "destructive"
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('nile-browser-history')
      setHistory([])
      setShowClearHistoryDialog(false)
      toast({
        title: "history cleared*",
        description: "your browsing history has been cleared*",
      })
    } catch (error) {
      console.error('Error clearing history:', error)
      toast({
        title: "error*",
        description: "failed to clear history* please try again*",
        variant: "destructive"
      })
    }
  }

  const downloadData = () => {
    const data = {
      tabs: localStorage.getItem('nile-homepage-tiles'),
      history: history,
      settings: {
        adBlockEnabled,
        trackingProtection,
        theme: currentTheme
      },
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nile-browser-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "data exported*",
      description: "your browsing data has been downloaded successfully*",
    })
  }

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
    localStorage.setItem('theme', theme)
    
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    toast({
      title: "theme updated*",
      description: `theme changed to ${theme}*`,
    })
  }

  const themes = [
    { id: 'light', name: 'light*', icon: Sun },
    { id: 'dark', name: 'dark*', icon: Moon },
    { id: 'system', name: 'system*', icon: Monitor }
  ]

  const handleAccountClick = () => {
    if (user) {
      onOpenProfile()
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <>
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <SettingsIcon className="h-5 w-5" />
              settings*
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-all hover:scale-110"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              browsing*
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">proxy mode*</div>
                  <div className="text-xs text-muted-foreground">access blocked websites*</div>
                </div>
                <Switch checked={proxyEnabled} onCheckedChange={handleProxyToggle} />
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  default search engine*
                </div>
                <Select value={defaultSearchEngine} onValueChange={handleSearchEngineChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchEngines.map((engine) => (
                      <SelectItem key={engine.id} value={engine.id}>
                        {engine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              appearance*
            </h3>
            
            <div className="space-y-2">
              {themes.map((theme) => {
                const Icon = theme.icon
                return (
                  <Button
                    key={theme.id}
                    variant={currentTheme === theme.id ? "default" : "outline"}
                    onClick={() => handleThemeChange(theme.id)}
                    className="w-full justify-start text-sm h-auto py-3"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {theme.id === 'system' ? 'follow system preference*' : `${theme.name} theme*`}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              privacy & security*
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">ad blocker*</div>
                  <div className="text-xs text-muted-foreground">block ads and trackers*</div>
                </div>
                <Switch checked={adBlockEnabled} onCheckedChange={setAdBlockEnabled} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">tracking protection*</div>
                  <div className="text-xs text-muted-foreground">enhanced privacy protection*</div>
                </div>
                <Switch checked={trackingProtection} onCheckedChange={setTrackingProtection} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="h-4 w-4" />
              browsing history ({history.length})*
            </h3>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.length > 0 ? (
                history.slice(0, 10).map((entry, index) => (
                  <div key={index} className="text-xs p-2 bg-muted/30 rounded border">
                    <div className="font-medium truncate">{entry.title.toLowerCase()}*</div>
                    <div className="text-muted-foreground truncate">{entry.displayUrl.toLowerCase()}*</div>
                    <div className="text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}*
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  no browsing history yet*
                </div>
              )}
            </div>
            
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowClearHistoryDialog(true)}
                className="w-full justify-start text-sm h-auto py-3 text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                clear history*
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Download className="h-4 w-4" />
              data management*
            </h3>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={downloadData}
                className="w-full justify-start text-sm h-auto py-3"
              >
                <Download className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">export data*</div>
                  <div className="text-xs text-muted-foreground">download your browsing data*</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowClearDataDialog(true)}
                disabled={isClearing}
                className="w-full justify-start text-sm h-auto py-3 text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">clear all data*</div>
                  <div className="text-xs text-muted-foreground">remove all stored data*</div>
                </div>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">account*</h3>
            <Button
              variant="outline"
              onClick={handleAccountClick}
              className="w-full justify-start text-sm h-auto py-3"
            >
              {user ? (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs mr-2">
                  {user.email?.charAt(0).toLowerCase()}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs mr-2">
                  ?
                </div>
              )}
              <div className="text-left">
                <div className="font-medium">
                  {user ? 'manage profile*' : 'sign in*'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user ? user.email?.toLowerCase() + '*' : 'sync your data across devices*'}
                </div>
              </div>
            </Button>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                window.open('https://buymeacoffee.com/your-username', '_blank')
              }}
              className="w-full justify-start text-sm h-auto py-3 border-orange-500/20 hover:bg-orange-500/10 text-orange-600"
            >
              <Heart className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">tip creator*</div>
                <div className="text-xs text-muted-foreground">support the developer*</div>
              </div>
            </Button>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                if (onShowMigration) {
                  onShowMigration()
                  onClose()
                }
              }}
              disabled={!onShowMigration}
              className="w-full justify-start text-sm h-auto py-3"
            >
              <FileDown className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">import from other browser*</div>
                <div className="text-xs text-muted-foreground">migrate bookmarks and history*</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (onShowProtocolHandler) {
                  onShowProtocolHandler()
                  onClose()
                }
              }}
              disabled={!onShowProtocolHandler}
              className="w-full justify-start text-sm h-auto py-3"
            >
              <Link className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">set as default browser*</div>
                <div className="text-xs text-muted-foreground">manage protocol handlers*</div>
              </div>
            </Button>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="h-4 w-4" />
              about*
            </div>
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/20 rounded-lg">
              <div className="font-medium">nile browser v1.0.0*</div>
              <div>a fully featured browser for macos*</div>
              <div className="flex items-center gap-1">
                developed with ❤️ for privacy*
              </div>
            </div>
          </div>

          <div className="text-center pt-2 border-t">
            <p className="text-xs text-muted-foreground/70">
              this is a work in progress, bugs may happen*
            </p>
          </div>
        </CardContent>
      </Card>

      <NativeConfirmDialog
        isOpen={showClearDataDialog}
        title="clear all data?*"
        message="this will permanently delete all your browsing data, including saved tabs, bookmarks, website preferences, and search history* this action cannot be undone*"
        confirmText="yes, clear all*"
        cancelText="cancel*"
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearDataDialog(false)}
        variant="destructive"
      />

      <NativeConfirmDialog
        isOpen={showClearHistoryDialog}
        title="clear history?*"
        message="this will permanently delete your browsing history* this action cannot be undone*"
        confirmText="yes, clear*"
        cancelText="cancel*"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearHistoryDialog(false)}
        variant="destructive"
      />

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  )
}