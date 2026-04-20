import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isMobileNavOpen: boolean
  theme: 'dark' | 'light'
  activeCategory: string
  toggleSidebar: () => void
  toggleMobileNav: () => void
  setTheme: (theme: 'dark' | 'light') => void
  setActiveCategory: (category: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  isMobileNavOpen: false,
  theme: 'dark',
  activeCategory: 'All',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  setTheme: (theme) => set({ theme }),
  setActiveCategory: (category) => set({ activeCategory: category }),
}))
