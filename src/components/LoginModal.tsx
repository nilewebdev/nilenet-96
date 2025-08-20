
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Mail, Lock, User, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { signUp, signIn } = useAuth()

  if (!isOpen) return null

  const showNotification = (title: string, description: string, variant?: 'default' | 'destructive') => {
    // Try shadcn toast first
    const result = toast({
      title,
      description,
      variant,
    })
    
    // Fallback to sonner if shadcn toast doesn't work
    if (!result.id) {
      if (variant === 'destructive') {
        sonnerToast.error(title, { description })
      } else {
        sonnerToast.success(title, { description })
      }
    }
  }

  const handleAuth = async () => {
    if (!email || !password) {
      showNotification(
        "Missing Information",
        "Please enter both email and password to continue",
        "destructive"
      )
      return
    }

    if (password.length < 6) {
      showNotification(
        "Password Too Short",
        "Your password must be at least 6 characters long for security",
        "destructive"
      )
      return
    }

    setIsLoading(true)
    setShowSuccess(false)
    
    try {
      if (isSignUp) {
        await signUp(email, password)
        setShowSuccess(true)
        showNotification(
          "Account Created Successfully! 🎉",
          "We've sent a confirmation email to your inbox. Please verify your email before signing in to complete the setup."
        )
        
        // Auto-switch to sign in after a moment
        setTimeout(() => {
          setIsSignUp(false)
          setPassword('')
          setShowSuccess(false)
        }, 3000)
      } else {
        await signIn(email, password)
        setShowSuccess(true)
        showNotification(
          "Welcome Back! 👋",
          "You've been signed in successfully. Your tabs and settings are now synced across devices."
        )
        
        // Close modal after brief success display
        setTimeout(() => {
          onClose()
          setEmail('')
          setPassword('')
          setShowSuccess(false)
        }, 1500)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      let errorTitle = "Authentication Failed"
      let errorMessage = "Something went wrong. Please try again."
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorTitle = "Invalid Credentials"
          errorMessage = "The email or password you entered is incorrect. Please double-check and try again."
        } else if (error.message.includes('User already registered')) {
          errorTitle = "Email Already Registered"
          errorMessage = "This email is already associated with an account. Please sign in instead."
          setIsSignUp(false)
        } else if (error.message.includes('Email not confirmed')) {
          errorTitle = "Email Not Verified"
          errorMessage = "Please check your email and click the confirmation link before signing in."
        } else if (error.message.includes('signup disabled')) {
          errorTitle = "Signup Temporarily Disabled"
          errorMessage = "Account creation is temporarily unavailable. Please try again later."
        } else {
          errorMessage = error.message
        }
      }
      
      showNotification(errorTitle, errorMessage, "destructive")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setIsSignUp(false)
    setShowSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <Card className={`w-full max-w-md mx-auto shadow-2xl border-2 transition-all duration-300 bg-background/95 backdrop-blur-sm animate-scale-in ${
        showSuccess ? 'border-green-500/50 shadow-green-500/20' : 'border-primary/20'
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {showSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
              {showSuccess 
                ? (isSignUp ? 'Account Created!' : 'Welcome Back!') 
                : (isSignUp ? 'Create Account' : 'Welcome Back')
              }
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted rounded-lg transition-all hover:scale-110"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-muted-foreground">
            {showSuccess ? (
              isSignUp 
                ? 'Please check your email to verify your account before signing in.'
                : 'You\'re now signed in and your data is synced across devices.'
            ) : (
              isSignUp 
                ? 'Join Nile.Net to sync your tabs and settings across devices'
                : 'Sign in to access your synced tabs and personalized settings'
            )}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!showSuccess && (
            <>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 transition-all duration-200 focus:scale-105 h-12"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 transition-all duration-200 focus:scale-105 h-12"
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  />
                </div>
              </div>

              <Button
                onClick={handleAuth}
                disabled={isLoading || !email || !password}
                className="w-full bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-current mr-2"></div>
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  disabled={isLoading}
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : 'Need an account? Sign up'
                  }
                </Button>
              </div>
            </>
          )}
          
          {showSuccess && (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Switching to sign in...' : 'Redirecting...'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
