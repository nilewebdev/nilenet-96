
export const themes = {
  'nile-default': {
    name: 'Nile Default',
    colors: {
      primary: '250 100% 70%', // Purple-blue
      primaryForeground: '0 0% 100%',
      secondary: '260 80% 85%',
      accent: '270 95% 75%',
      background: '0 0% 100%',
      surface: '0 0% 98%',
      muted: '240 20% 95%',
      border: '240 30% 90%',
      gradient: 'linear-gradient(135deg, hsl(250 100% 70%) 0%, hsl(270 95% 75%) 100%)'
    }
  },
  'solar': {
    name: 'Solar',
    colors: {
      primary: '45 100% 60%', // Amber/orange
      primaryForeground: '0 0% 0%',
      secondary: '35 85% 75%', 
      accent: '25 95% 65%',
      background: '0 0% 100%',
      surface: '45 30% 98%',
      muted: '40 20% 95%',
      border: '40 30% 90%',
      gradient: 'linear-gradient(135deg, hsl(45 100% 60%) 0%, hsl(25 95% 65%) 100%)'
    }
  },
  'monochrome': {
    name: 'Monochrome',
    colors: {
      primary: '0 0% 15%', // Black
      primaryForeground: '0 0% 100%',
      secondary: '0 0% 85%',
      accent: '0 0% 25%',
      background: '0 0% 100%',
      surface: '0 0% 98%',
      muted: '0 0% 95%',
      border: '0 0% 90%',
      gradient: 'linear-gradient(135deg, hsl(0 0% 15%) 0%, hsl(0 0% 45%) 100%)'
    }
  }
}

export type ThemeName = keyof typeof themes

export const applyTheme = (themeName: ThemeName) => {
  const theme = themes[themeName]
  const root = document.documentElement
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
  })
  
  // Store theme preference
  localStorage.setItem('nile-theme', themeName)
}

export const getCurrentTheme = (): ThemeName => {
  const stored = localStorage.getItem('nile-theme') as ThemeName
  return stored && themes[stored] ? stored : 'nile-default'
}

// New function to save homepage layout
export const saveHomepageLayout = (layout: any) => {
  localStorage.setItem('nile-homepage-layout', JSON.stringify(layout))
}

export const getHomepageLayout = () => {
  const saved = localStorage.getItem('nile-homepage-layout')
  return saved ? JSON.parse(saved) : null
}
