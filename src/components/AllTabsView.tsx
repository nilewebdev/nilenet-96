
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Plus, Globe, Eye, EyeOff } from 'lucide-react'
import { Tab } from './TabBar'

interface AllTabsViewProps {
  tabs: Tab[]
  privateTabs?: Tab[]
  isPrivateMode?: boolean
  onTabSelect?: (tabId: string) => void
  onSelectTab?: (tabId: string) => void
  onTabClose?: (tabId: string) => void
  onCloseTab?: (tabId: string) => void
  onNewTab: () => void
  onClose: () => void
  onSearch?: (query: string, displayUrl?: string) => void
}

export const AllTabsView: React.FC<AllTabsViewProps> = ({
  tabs,
  privateTabs = [],
  isPrivateMode = false,
  onTabSelect,
  onSelectTab,
  onTabClose,
  onCloseTab,
  onNewTab,
  onClose,
  onSearch
}) => {
  const currentTabs = isPrivateMode ? privateTabs : tabs
  const handleSelectTab = onTabSelect || onSelectTab || (() => {})
  const handleCloseTab = onTabClose || onCloseTab || (() => {})

  const handleTabClick = (tabId: string) => {
    const selectedTab = currentTabs.find(tab => tab.id === tabId)
    
    if (selectedTab) {
      // First select the tab
      handleSelectTab(tabId)
      
      // If the tab has a URL and we have onSearch function, trigger search to reload the page
      if (selectedTab.url && selectedTab.url.trim() !== '' && onSearch) {
        // Use the original URL (without proxy modifications) for search
        const originalUrl = selectedTab.displayUrl || selectedTab.url
        console.log('AllTabsView: Triggering search for tab URL:', originalUrl)
        onSearch(originalUrl, originalUrl)
      }
    }
    
    onClose() // Close the all tabs view after selection
  }

  return (
    <div className="absolute inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            all tabs ({currentTabs.length})*
          </h2>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
            {isPrivateMode ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {isPrivateMode ? 'private*' : 'normal*'}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentTabs.map((tab, index) => (
          <Card key={tab.id} className={`cursor-pointer hover:bg-accent/50 transition-colors ${tab.isActive ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => handleTabClick(tab.id)}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tab.isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-primary"></div>
                    ) : (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {tab.title || 'New Tab'}
                    </div>
                    {tab.displayUrl && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {tab.displayUrl.replace(/^https?:\/\//, '')}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloseTab(tab.id)
                  }}
                  className="h-8 w-8 p-0 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  disabled={currentTabs.length === 1}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
          <CardContent className="p-4">
            <div 
              className="flex items-center gap-3 justify-center text-muted-foreground"
              onClick={() => {
                onNewTab()
                onClose()
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">new tab*</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
