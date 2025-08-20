
import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ExternalLink, WifiOff } from 'lucide-react'
import { ErrorModal } from './browser/ErrorModal'

interface BrowserViewProps {
  url: string
  isActive: boolean
  onTitleChange: (title: string) => void
  onLoadStart: () => void
  onLoadEnd: () => void
}

export const BrowserView = forwardRef<HTMLIFrameElement, BrowserViewProps>(({
  url,
  isActive,
  onTitleChange,
  onLoadStart,
  onLoadEnd
}, ref) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorUrl, setErrorUrl] = useState('')
  const [loadAttempted, setLoadAttempted] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (url && isActive && url !== 'version-page') {
      console.log('BrowserView: Loading URL:', url)
      setFadeIn(false)
      loadPage(url)
    }
  }, [url, isActive])

  const loadPage = async (targetUrl: string) => {
    if (!isOnline) {
      setError('No internet connection')
      return
    }

    if (targetUrl === 'version-page' || targetUrl.startsWith('version-page?')) {
      setError(null)
      setIsLoading(false)
      onLoadEnd()
      return
    }

    console.log('BrowserView: Starting to load page:', targetUrl)
    setIsLoading(true)
    setError(null)
    setShowErrorModal(false)
    setLoadAttempted(true)
    onLoadStart()

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      const cleanUrl = targetUrl.split('?_reload=')[0]
      const domain = new URL(cleanUrl).hostname.replace('www.', '')
      const title = domain || 'New Tab'
      onTitleChange(title)

      // Set a reasonable timeout for all sites
      timeoutRef.current = setTimeout(() => {
        console.log('BrowserView: Page load timeout for:', targetUrl)
        handleLoadError()
      }, 10000) // 10 second timeout for all sites
      
    } catch (err) {
      console.error('BrowserView: Error processing URL:', err)
      setError('Invalid URL')
      setIsLoading(false)
      onLoadEnd()
    }
  }

  const handleIframeLoad = () => {
    console.log('BrowserView: Iframe loaded successfully for:', url)
    setIsLoading(false)
    setError(null)
    onLoadEnd()
    
    // Add smooth fade-in animation
    setTimeout(() => setFadeIn(true), 100)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleLoadError = () => {
    console.log('BrowserView: Failed to load:', url)
    setErrorUrl(url)
    setShowErrorModal(true)
    setError('Failed to load page')
    setIsLoading(false)
    onLoadEnd()
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleIframeError = () => {
    console.log('BrowserView: Iframe error for:', url)
    handleLoadError()
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  console.log('BrowserView: Rendering with isActive:', isActive, 'url:', url, 'error:', error)

  if (!isActive) {
    console.log('BrowserView: Not active, hiding')
    return null
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        url={errorUrl}
      />

      {/* Offline Banner */}
      {!isOnline && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-destructive/10 border-destructive/20 flex-shrink-0">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <span>Offline Mode - Browsing is disabled</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Loading State */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-10 flex-shrink-0 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent animate-pulse w-full origin-left transform scale-x-0 animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && !showErrorModal && (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/20">
          <div className="text-center space-y-6 max-w-md animate-fade-in">
            <div className="text-6xl animate-bounce mb-4">😔</div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground">page won't load*</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                this wont work atm, donate to see it wrk*
              </p>
            </div>
            <Button
              onClick={() => window.open('https://buymeacoffee.com/your-username', '_blank')}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl hover:scale-105 transition-all duration-200 font-medium shadow-lg"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              donate to fix*
            </Button>
          </div>
        </div>
      )}

      {/* Website Content */}
      {!error && url && url !== 'version-page' && !url.startsWith('version-page?') && (
        <div className="flex-1 relative">
          <iframe
            ref={ref}
            src={url}
            className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-300 ${
              fadeIn ? 'opacity-100' : 'opacity-0'
            }`}
            title="Website Content"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="fullscreen; autoplay; encrypted-media; picture-in-picture; geolocation"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation allow-downloads"
          />
        </div>
      )}
    </div>
  )
})
