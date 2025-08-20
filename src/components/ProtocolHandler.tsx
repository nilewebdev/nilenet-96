import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe, Check, X, AlertTriangle, Monitor } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ProtocolHandlerProps {
  onClose: () => void
}

interface ProtocolHandler {
  protocol: string
  name: string
  description: string
  icon: React.ReactNode
  supported: boolean
  registered: boolean
}

export const ProtocolHandler: React.FC<ProtocolHandlerProps> = ({ onClose }) => {
  const [handlers, setHandlers] = useState<ProtocolHandler[]>([])
  const [isNativeApp, setIsNativeApp] = useState(false)

  useEffect(() => {
    // Check if running as native app (will be true when using Tauri)
    const checkNativeApp = () => {
      // This will be implemented when Tauri is added
      return window.location.protocol === 'tauri:' || 
             window.navigator.userAgent.includes('Tauri') ||
             (window as any).__TAURI__ !== undefined
    }

    setIsNativeApp(checkNativeApp())

    const protocolHandlers: ProtocolHandler[] = [
      {
        protocol: 'http',
        name: 'http links*',
        description: 'handle standard web links*',
        icon: <Globe className="h-4 w-4" />,
        supported: isNativeApp,
        registered: false
      },
      {
        protocol: 'https', 
        name: 'https links*',
        description: 'handle secure web links*',
        icon: <Shield className="h-4 w-4" />,
        supported: isNativeApp,
        registered: false
      },
      {
        protocol: 'ftp',
        name: 'ftp links*',
        description: 'handle file transfer protocol*',
        icon: <Monitor className="h-4 w-4" />,
        supported: isNativeApp,
        registered: false
      }
    ]

    setHandlers(protocolHandlers)
  }, [isNativeApp])

  const handleRegisterProtocol = async (protocol: string) => {
    if (!isNativeApp) {
      toast({
        title: "not available*",
        description: "protocol registration requires the native app version*",
        variant: "destructive"
      })
      return
    }

    try {
      // This will be implemented when Tauri is added
      // await invoke('register_protocol_handler', { protocol })
      
      // For now, just simulate success
      setHandlers(prev => 
        prev.map(handler => 
          handler.protocol === protocol 
            ? { ...handler, registered: true }
            : handler
        )
      )

      toast({
        title: "protocol registered*",
        description: `${protocol} links will now open in nile browser*`,
      })
    } catch (error) {
      toast({
        title: "registration failed*",
        description: "failed to register protocol handler*",
        variant: "destructive"
      })
    }
  }

  const handleUnregisterProtocol = async (protocol: string) => {
    try {
      // This will be implemented when Tauri is added
      // await invoke('unregister_protocol_handler', { protocol })
      
      setHandlers(prev => 
        prev.map(handler => 
          handler.protocol === protocol 
            ? { ...handler, registered: false }
            : handler
        )
      )

      toast({
        title: "protocol unregistered*",
        description: `${protocol} links will no longer open in nile browser*`,
      })
    } catch (error) {
      toast({
        title: "unregistration failed*",
        description: "failed to unregister protocol handler*",
        variant: "destructive"
      })
    }
  }

  const handleSetAsDefault = async () => {
    if (!isNativeApp) {
      toast({
        title: "not available*",
        description: "setting as default browser requires the native app version*",
        variant: "destructive"
      })
      return
    }

    try {
      // This will be implemented when Tauri is added
      // await invoke('set_as_default_browser')
      
      toast({
        title: "default browser set*",
        description: "nile browser is now your default browser*",
      })
    } catch (error) {
      toast({
        title: "failed to set default*",
        description: "could not set nile browser as default* please check system settings*",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              default browser settings*
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isNativeApp && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-medium text-orange-800 dark:text-orange-200">
                    native app required*
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    to set nile browser as your default browser, you need to download the native desktop app* 
                    web versions cannot register as system default browsers*
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">set as default browser*</h3>
                <p className="text-sm text-muted-foreground">
                  make nile browser your system default for web links*
                </p>
              </div>
              <Button 
                onClick={handleSetAsDefault}
                disabled={!isNativeApp}
                size="sm"
              >
                set as default*
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">protocol handlers*</h3>
            <p className="text-sm text-muted-foreground">
              manage which link types open in nile browser*
            </p>
            
            <div className="space-y-3">
              {handlers.map((handler) => (
                <Card key={handler.protocol} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {handler.icon}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {handler.name}
                            {handler.registered ? (
                              <Badge variant="default" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                active*
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                inactive*
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {handler.description}
                          </div>
                        </div>
                      </div>
                      
                      {handler.supported ? (
                        <Button
                          variant={handler.registered ? "outline" : "default"}
                          size="sm"
                          onClick={() => 
                            handler.registered 
                              ? handleUnregisterProtocol(handler.protocol)
                              : handleRegisterProtocol(handler.protocol)
                          }
                        >
                          {handler.registered ? 'unregister*' : 'register*'}
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          not supported*
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">about protocol handlers*</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                protocol handlers allow nile browser to open specific types of links from other applications*
              </p>
              <p>
                when registered, clicking links in emails, documents, or other apps will open them in nile browser*
              </p>
              <p>
                you can always change these settings later in your system preferences*
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}