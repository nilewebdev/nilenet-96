import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface OnboardingProps {
  onComplete: () => void
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  
  const { signUp, signIn } = useAuth()

  // Check if onboarding was already completed
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('nile-onboarding-completed')
    if (onboardingCompleted === 'true') {
      onComplete()
    }
  }, [onComplete])

  const totalSteps = 6

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setSlideDirection('right')
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setSlideDirection('left')
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAuth = async () => {
    if (!email || !password) return

    setIsLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      handleNext()
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipAuth = () => {
    handleNext()
  }

  const handleComplete = () => {
    // Mark onboarding as completed in localStorage
    localStorage.setItem('nile-onboarding-completed', 'true')
    onComplete()
  }

  const handleSkipOnboarding = () => {
    // Mark onboarding as completed and skip to the end
    localStorage.setItem('nile-onboarding-completed', 'true')
    onComplete()
  }

  const detectPlatform = () => {
    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    if (!isMobile) return 'Desktop'
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS'
    if (/Android/.test(userAgent)) return 'Android'
    return 'Mobile'
  }

  const platform = detectPlatform()

  const steps = [
    {
      icon: '🌍',
      title: 'welcome to nile.net*',
      text: 'a fast, private, customizable mobile browser.'
    },
    {
      icon: '🔥',
      title: 'burn*',
      text: 'tap the 🚨 in the search bar to instantly hide all tabs.'
    },
    {
      icon: '👤',
      title: 'ur profile*',
      text: 'keep bookmarks, tabs, and settings in sync across devices.'
    },
    {
      icon: '🚀',
      title: 'ai powered browsing*',
      text: 'currently using Bing by default. type //engine to learn why.*'
    },
    {
      icon: '🔑',
      title: 'register/login*',
      text: 'set up your nile account to unlock sync & customizations.'
    },
    {
      icon: '📲',
      title: 'Install Nile.Net',
      text: platform === 'iOS' 
        ? 'to use nile.net* like an app, tap share and choose "Add to Home Screen".*'
        : platform === 'Android'
        ? 'tap "Install" in the browser menu to add nile.net* to your device.*'
        : platform === 'Desktop'
        ? 'do u want to install the  nile.net* .exe for a native desktop experience?*'
        : 'bookmark this page for quick access to  nile.net*'
    }
  ]

  const currentStepData = steps[currentStep - 1]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStep > 1) {
                  setSlideDirection('left')
                  setCurrentStep(currentStep - 1)
                }
              }}
              disabled={currentStep === 1}
              className="opacity-50 hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i + 1 <= currentStep ? 'bg-primary scale-110' : 'bg-muted scale-90'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStep < totalSteps) {
                  setSlideDirection('right')
                  setCurrentStep(currentStep + 1)
                } else {
                  handleComplete()
                }
              }}
              className="opacity-50 hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div 
            key={currentStep}
            className={`animate-fade-in transition-all duration-500 ${
              slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            }`}
          >
            <div className="text-6xl mb-4 animate-bounce">{currentStepData.icon}</div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {currentStepData.title}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div 
            key={`content-${currentStep}`}
            className="animate-fade-in transition-all duration-300"
          >
            <p className="text-center text-muted-foreground leading-relaxed">
              {currentStepData.text}
            </p>
          </div>

          {/* First Step - Skip Option */}
          {currentStep === 1 && (
            <div className="text-center animate-scale-in">
              <Button
                variant="outline"
                onClick={handleSkipOnboarding}
                className="w-full hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Already done the setup in browser (Skip→)
              </Button>
            </div>
          )}

          {/* Auth Step */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-scale-in">
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!email || !password) return
                    setIsLoading(true)
                    try {
                      if (isSignUp) {
                        await signUp(email, password)
                      } else {
                        await signIn(email, password)
                      }
                      setSlideDirection('right')
                      setCurrentStep(currentStep + 1)
                    } catch (error) {
                      console.error('Auth error:', error)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading || !email || !password}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSignUp ? 'already have an account? sign in*' : 'need an account? sign up*'}
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSlideDirection('right')
                  setCurrentStep(currentStep + 1)
                }}
                className="w-full hover:scale-105 transition-all duration-200"
              >
                Maybe Later
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== 5 && currentStep !== 1 && (
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSlideDirection('left')
                    setCurrentStep(currentStep - 1)
                  }}
                  className="flex-1 hover:scale-105 transition-all duration-200"
                >
                  Back
                </Button>
              )}
              
              <Button
                onClick={() => {
                  if (currentStep === totalSteps) {
                    handleComplete()
                  } else {
                    setSlideDirection('right')
                    setCurrentStep(currentStep + 1)
                  }
                }}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {currentStep === totalSteps ? 'Done' : 'Next'}
              </Button>
            </div>
          )}

          {/* First Step Navigation */}
          {currentStep === 1 && (
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSlideDirection('right')
                  setCurrentStep(currentStep + 1)
                }}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
