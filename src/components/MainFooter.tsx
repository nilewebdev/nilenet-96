
import React from 'react'
import { Home, Grid3X3, User, Settings, Clock, Star, Database, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MainFooterProps {
  onOpenProfile: () => void
  onOpenSettings: () => void
  onShowHome: () => void
  onShowAllTabs: () => void
  onShowHistory: () => void
  onShowBookmarks: () => void
  onShowSearchIndexing?: () => void
  onShowDownloads?: () => void
}

export const MainFooter: React.FC<MainFooterProps> = ({
  onOpenProfile,
  onOpenSettings,
  onShowHome,
  onShowAllTabs,
  onShowHistory,
  onShowBookmarks,
  onShowSearchIndexing,
  onShowDownloads
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-2 z-40">
      <div className="flex justify-around items-center max-w-full mx-auto px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowHome}
          className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          <span className="text-xs font-medium">home*</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowAllTabs}
          className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="text-xs font-medium">tabs*</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowHistory}
          className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium">history*</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowBookmarks}
          className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Star className="h-4 w-4" />
          <span className="text-xs font-medium">saved*</span>
        </Button>

        {onShowSearchIndexing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowSearchIndexing}
            className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <Database className="h-4 w-4" />
            <span className="text-xs font-medium">index*</span>
          </Button>
        )}

        {onShowDownloads && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowDownloads}
            className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            <span className="text-xs font-medium">downloads*</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 px-2 py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="text-xs font-medium">more*</span>
        </Button>
      </div>
    </div>
  )
}
