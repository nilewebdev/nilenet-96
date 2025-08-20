import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Globe, Shield, Smartphone, Zap, Users } from 'lucide-react'

export const VersionsPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Nile.Net</span>
          </div>
          <h1 className="text-4xl font-bold">about nile.net*</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            a privacy-focused progressive web app browser designed for unrestricted access and elegant browsing.*
          </p>
        </div>

        {/* Current Version */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Current Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-lg px-3 py-1">
                  beta *1.02
                </Badge>
                <span className="text-muted-foreground">releasing Q4 2026*</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    privacy features
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• proxy integration for unblocked access*</li>
                    <li>• no tracking or data collection*</li>
                    <li>• burn* button for instant privacy*</li>
                    <li>• private browsing by default*</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    mobile-first design*
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• progressive web app* (PWA)</li>
                    <li>• touch-optimized interface*</li>
                    <li>• responsive design*</li>
                    <li>• offline capabilities*</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                browsing*
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• tabbed browsing*</p>
              <p>• search engine shortcuts* (!yt, !wiki)</p>
              <p>• bang cmnds support*</p>
              <p>• homepage with quick tiles*</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                privacy*
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• proxy toggle* (ProxySite)</p>
              <p>• no browsing history stored via the cloud*</p>
              <p>• zero data collection*</p>
              <p>• emergency panic mode*</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                performance*
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• fast loading times*</p>
              <p>• lightweight design*</p>
              <p>• service worker caching*</p>
              <p>• optimized for mobile*</p>
            </CardContent>
          </Card>
        </div>

        {/* Developer Info */}
        <Card className="bg-gradient-to-r from-muted/30 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              dev's details*
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-lg">Rheon Notisce - Gordon</h4>
                <p className="text-muted-foreground">privacy-focused web applications developer</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">pwa specialist*</Badge>
                <Badge variant="secondary">mobile-first design*</Badge>
                <Badge variant="secondary">privacy advocate*</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Frontend</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• React 18 with TypeScript</p>
                  <p>• Tailwind CSS for styling</p>
                  <p>• Shadcn/ui components</p>
                  <p>• Vite build system</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Service Worker for offline support</p>
                  <p>• Local Storage for settings</p>
                  <p>• Responsive design system</p>
                  <p>• Progressive Web App manifest</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hosting Info */}
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-300">Hosted on Netlify</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Fast, secure, and reliable hosting with global CDN
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Special Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">//versions</code>
                <span className="text-sm text-muted-foreground">Show this page</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">//about</code>
                <span className="text-sm text-muted-foreground">Show this page</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
