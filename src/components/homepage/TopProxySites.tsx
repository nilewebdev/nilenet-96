
import React from 'react'
import { Globe, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ProxySite {
  id: string
  name: string
  url: string
  description: string
}

const proxySites: ProxySite[] = [
  { id: '1', name: 'hide.me*', url: 'https://hide.me/en/proxy', description: 'free web proxy*' },
  { id: '2', name: 'kproxy*', url: 'https://kproxy.com', description: 'anonymous browsing*' },
  { id: '3', name: 'proxysite*', url: 'https://proxysite.com', description: 'unblock websites*' },
  { id: '4', name: '4everproxy*', url: 'https://4everproxy.com', description: 'free proxy service*' },
  { id: '5', name: 'webshare*', url: 'https://proxy.webshare.io', description: 'premium proxy*' },
  { id: '6', name: 'filterbypass*', url: 'https://filterbypass.me', description: 'bypass filters*' },
]

interface TopProxySitesProps {
  onProxyClick: (url: string) => void
}

export const TopProxySites: React.FC<TopProxySitesProps> = ({ onProxyClick }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">top proxy sites*</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {proxySites.map((proxy) => (
          <Card 
            key={proxy.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 bg-gradient-to-br from-background to-muted/20 border-muted/30"
            onClick={() => onProxyClick(proxy.url)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-foreground">{proxy.name}</h3>
                <p className="text-xs text-muted-foreground">{proxy.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
