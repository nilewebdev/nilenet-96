import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set default theme to dark
const savedTheme = localStorage.getItem('theme')
if (!savedTheme) {
  localStorage.setItem('theme', 'dark')
  document.documentElement.classList.add('dark')
} else if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else if (savedTheme === 'system') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (prefersDark) {
    document.documentElement.classList.add('dark')
  }
}

createRoot(document.getElementById("root")!).render(<App />);
