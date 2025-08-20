import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvouigfgclpgjifpsttk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2b3VpZ2ZnY2xwZ2ppZnBzdHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTI4MTksImV4cCI6MjA2NjY4ODgxOX0.LFUgg9axmx38G_8dckvEPE5AQh16ZIq7x6iTaDqBJD8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Profile {
  id: string
  email: string
  nickname?: string
  profile_color?: string
  theme: string
  bookmarks: any[]
  homepage_layout: any
  homepage_tiles: any[]
  weather_enabled: boolean
  browsing_history?: any[]
  default_search_engine: string
  created_at: string
  updated_at: string
}

export interface SavedTab {
  id: string
  user_id: string
  url: string
  title: string
  position: number
  is_active: boolean
  created_at: string
}

export interface HomepageTile {
  id: string
  name: string
  url: string
  icon: string
  category: string
  position: number
}

// Homepage API functions
export const saveHomepageTiles = async (userId: string, tiles: HomepageTile[]) => {
  const { error } = await supabase
    .from('profiles')
    .update({ homepage_tiles: tiles, updated_at: new Date().toISOString() })
    .eq('id', userId)
  
  if (error) throw error
}

export const loadHomepageTiles = async (userId: string): Promise<HomepageTile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('homepage_tiles')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data?.homepage_tiles || []
}

// Add history sync functions
export const saveHistoryToCloud = async (userId: string, history: any[]) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      browsing_history: history,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
  
  if (error) throw error
}

export const loadHistoryFromCloud = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('browsing_history')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data?.browsing_history || []
}

// Add saved tabs sync functions
export const saveTabsToCloud = async (userId: string, tabs: any[]) => {
  const { error } = await supabase
    .from('saved_tabs')
    .upsert(
      tabs.map((tab, index) => ({
        user_id: userId,
        url: tab.url || '',
        title: tab.title || 'New Tab',
        position: index,
        is_active: tab.isActive || false
      })),
      { onConflict: 'user_id,position' }
    )
  
  if (error) throw error
}

export const loadTabsFromCloud = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('saved_tabs')
    .select('*')
    .eq('user_id', userId)
    .order('position')
  
  if (error) throw error
  return data || []
}
