
import React from 'react'
import { X, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  title: string
  url: string
  displayUrl: string
  isActive: boolean
  isLoading?: boolean
  favicon?: string
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string | null
  onTabSelect: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
  className?: string
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
  className
}) => {
  const maxVisibleTabs = 4 // For mobile

  return (
    <div className={cn("bg-surface/80 backdrop-blur-sm border-b border-border/50", className)}>
      <div className="flex items-center overflow-x-auto scrollbar-hide">
        {/* Tabs */}
        <div className="flex flex-1 min-w-0">
          {tabs.slice(0, maxVisibleTabs).map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center min-w-0 flex-1 max-w-[200px] border-r border-border/30 transition-all duration-300 ease-in-out",
                tab.id === activeTabId 
                  ? "bg-background border-b-2 border-b-primary shadow-sm" 
                  : "hover:bg-muted/30 hover:shadow-sm"
              )}
            >
              <button
                onClick={() => onTabSelect(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 flex-1 min-w-0 text-left transition-all duration-200",
                  tab.id === activeTabId ? "bg-background" : "hover:bg-muted/20"
                )}
              >
                {/* Favicon or Loading */}
                <div className="w-4 h-4 flex-shrink-0">
                  {tab.isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                  ) : tab.favicon ? (
                    <img 
                      src={tab.favicon} 
                      alt="" 
                      className="w-4 h-4 rounded-sm transition-transform duration-200 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-muted to-muted-foreground/20"></div>
                  )}
                </div>

                {/* Title */}
                <span className={cn(
                  "truncate text-sm font-medium transition-colors duration-200",
                  tab.id === activeTabId ? "text-foreground" : "text-muted-foreground"
                )}>
                  {(tab.title || 'new tab').toLowerCase()}*
                </span>
              </button>

              {/* Close Button */}
              {tabs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTabClose(tab.id)
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive mr-1 transition-all duration-200 hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}

          {/* Tab Overflow Indicator */}
          {tabs.length > maxVisibleTabs && (
            <div className="flex items-center px-2 text-xs text-muted-foreground bg-muted/20 border-r border-border/30">
              <span className="animate-pulse">+{tabs.length - maxVisibleTabs}</span>
            </div>
          )}
        </div>

        {/* New Tab Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewTab}
          className="flex-shrink-0 h-8 w-8 p-0 mx-1 hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
