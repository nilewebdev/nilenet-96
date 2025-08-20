
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export const SearchEngineInfo: React.FC = () => {
  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Bing is Our Default Search Engine
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    Important Notice About Site Compatibility
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    Due to our app's proxy-based architecture, many websites and search engines 
                    don't fully support embedded browsing. Don't be surprised if some sites don't work properly.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search Engine Compatibility
              </h3>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Bing</div>
                      <div className="text-sm text-muted-foreground">Works reliably with our proxy</div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Recommended
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">Google</div>
                      <div className="text-sm text-muted-foreground">Often blocks proxy requests</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                    Limited
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">DuckDuckGo</div>
                      <div className="text-sm text-muted-foreground">Doesn't allow embedding</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                    Blocked
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Why This Happens</h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  Nile.Net uses a proxy-based system to access websites. This allows us to provide 
                  privacy and bypass certain restrictions, but it also means:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Some sites detect proxy usage and block access</li>
                  <li>Security-focused sites may not allow embedding</li>
                  <li>Search engines have varying levels of proxy tolerance</li>
                  <li>Modern web security measures can interfere with proxied content</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What You Can Do</h3>
              <div className="space-y-3 text-muted-foreground">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use Bing for search - it works best with our system</li>
                  <li>Try different proxy servers if a site doesn't load</li>
                  <li>Use the "Open in Browser" button for sites that won't embed</li>
                  <li>Direct URL access often works better than search results</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                    Pro Tip
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    If you're having trouble accessing a specific site, try entering the URL directly 
                    instead of searching for it. Direct navigation often works better than going through search results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
