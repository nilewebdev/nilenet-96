import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Chrome, Globe, Download, Check, AlertCircle, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface BrowserMigrationProps {
  onClose: () => void
  onComplete: () => void
}

interface BrowserInfo {
  id: string
  name: string
  icon: React.ReactNode
  available: boolean
  bookmarks: number
  history: number
  passwords: number
}

interface MigrationData {
  bookmarks: boolean
  history: boolean
  passwords: boolean
  settings: boolean
}

export const BrowserMigration: React.FC<BrowserMigrationProps> = ({ onClose, onComplete }) => {
  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null)
  const [migrationData, setMigrationData] = useState<MigrationData>({
    bookmarks: true,
    history: true,
    passwords: false,
    settings: true
  })
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importComplete, setImportComplete] = useState(false)

  const browsers: BrowserInfo[] = [
    {
      id: 'chrome',
      name: 'google chrome*',
      icon: <Chrome className="h-6 w-6" />,
      available: true,
      bookmarks: 247,
      history: 1534,
      passwords: 89
    },
    {
      id: 'safari',
      name: 'safari*',
      icon: <Globe className="h-6 w-6 text-blue-500" />,
      available: true,
      bookmarks: 156,
      history: 892,
      passwords: 45
    },
    {
      id: 'firefox',
      name: 'firefox*',
      icon: <Globe className="h-6 w-6 text-orange-500" />,
      available: false,
      bookmarks: 0,
      history: 0,
      passwords: 0
    }
  ]

  const handleImport = async () => {
    if (!selectedBrowser) return

    setIsImporting(true)
    setImportProgress(0)

    // Simulate import process
    const steps = Object.entries(migrationData).filter(([_, enabled]) => enabled).length
    let currentStep = 0

    for (const [dataType, enabled] of Object.entries(migrationData)) {
      if (!enabled) continue

      currentStep++
      const progress = (currentStep / steps) * 100

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      setImportProgress(progress)

      // Import the data (mock implementation)
      if (dataType === 'bookmarks' && enabled) {
        await importBookmarks(selectedBrowser)
      } else if (dataType === 'history' && enabled) {
        await importHistory(selectedBrowser)
      } else if (dataType === 'settings' && enabled) {
        await importSettings(selectedBrowser)
      }
    }

    setImportComplete(true)
    toast({
      title: "import complete*",
      description: "successfully imported data from your previous browser*",
    })

    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  const importBookmarks = async (browserId: string) => {
    // Mock bookmark import
    const mockBookmarks = [
      { name: 'github*', url: 'https://github.com', folder: 'development*' },
      { name: 'stackoverflow*', url: 'https://stackoverflow.com', folder: 'development*' },
      { name: 'reddit*', url: 'https://reddit.com', folder: 'social*' },
      { name: 'youtube*', url: 'https://youtube.com', folder: 'entertainment*' },
      { name: 'wikipedia*', url: 'https://wikipedia.org', folder: 'reference*' }
    ]

    const existingBookmarks = JSON.parse(localStorage.getItem('nile-bookmarks') || '[]')
    const updatedBookmarks = [...existingBookmarks, ...mockBookmarks]
    localStorage.setItem('nile-bookmarks', JSON.stringify(updatedBookmarks))
  }

  const importHistory = async (browserId: string) => {
    // Mock history import
    const mockHistory = [
      { url: 'https://github.com', displayUrl: 'github.com', title: 'github*', timestamp: Date.now() - 3600000 },
      { url: 'https://stackoverflow.com', displayUrl: 'stackoverflow.com', title: 'stackoverflow*', timestamp: Date.now() - 7200000 },
      { url: 'https://reddit.com', displayUrl: 'reddit.com', title: 'reddit*', timestamp: Date.now() - 10800000 }
    ]

    const existingHistory = JSON.parse(localStorage.getItem('nile-browser-history') || '[]')
    const updatedHistory = [...mockHistory, ...existingHistory]
    localStorage.setItem('nile-browser-history', JSON.stringify(updatedHistory))
  }

  const importSettings = async (browserId: string) => {
    // Mock settings import based on browser
    if (browserId === 'chrome') {
      localStorage.setItem('nile-default-search-engine', 'google')
    } else if (browserId === 'safari') {
      localStorage.setItem('nile-default-search-engine', 'duckduckgo')
    }
  }

  if (importComplete) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">migration complete*</h3>
              <p className="text-sm text-muted-foreground mt-2">
                your data has been successfully imported*
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              import browser data*
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isImporting ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">importing data*</h3>
                <p className="text-sm text-muted-foreground">
                  this may take a few moments*
                </p>
              </div>
              <Progress value={importProgress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                {Math.round(importProgress)}% complete*
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold">select browser to import from*</h3>
                <div className="grid gap-3">
                  {browsers.map((browser) => (
                    <Card 
                      key={browser.id}
                      className={`cursor-pointer transition-all ${
                        selectedBrowser === browser.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : browser.available 
                            ? 'hover:bg-muted/50' 
                            : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => browser.available && setSelectedBrowser(browser.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {browser.icon}
                            <div>
                              <div className="font-medium">{browser.name}</div>
                              {browser.available ? (
                                <div className="text-xs text-muted-foreground">
                                  {browser.bookmarks} bookmarks*, {browser.history} history items*
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  not found*
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedBrowser === browser.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedBrowser && (
                <div className="space-y-4">
                  <h3 className="font-semibold">what would you like to import?*</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bookmarks"
                        checked={migrationData.bookmarks}
                        onCheckedChange={(checked) => 
                          setMigrationData(prev => ({ ...prev, bookmarks: !!checked }))
                        }
                      />
                      <label htmlFor="bookmarks" className="text-sm font-medium">
                        bookmarks & favorites*
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="history"
                        checked={migrationData.history}
                        onCheckedChange={(checked) => 
                          setMigrationData(prev => ({ ...prev, history: !!checked }))
                        }
                      />
                      <label htmlFor="history" className="text-sm font-medium">
                        browsing history*
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="passwords"
                        checked={migrationData.passwords}
                        onCheckedChange={(checked) => 
                          setMigrationData(prev => ({ ...prev, passwords: !!checked }))
                        }
                      />
                      <label htmlFor="passwords" className="text-sm font-medium">
                        saved passwords* (not available yet)
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="settings"
                        checked={migrationData.settings}
                        onCheckedChange={(checked) => 
                          setMigrationData(prev => ({ ...prev, settings: !!checked }))
                        }
                      />
                      <label htmlFor="settings" className="text-sm font-medium">
                        browser settings*
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  cancel*
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedBrowser || Object.values(migrationData).every(v => !v)}
                  className="flex-1"
                >
                  import data*
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}