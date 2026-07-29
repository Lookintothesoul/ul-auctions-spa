import { create } from 'zustand'

interface UiState {
  isMobileFiltersOpen: boolean
  openMobileFilters: () => void
  closeMobileFilters: () => void
  toggleMobileFilters: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isMobileFiltersOpen: false,
  openMobileFilters: () => set({ isMobileFiltersOpen: true }),
  closeMobileFilters: () => set({ isMobileFiltersOpen: false }),
  toggleMobileFilters: () => set((state) => ({ isMobileFiltersOpen: !state.isMobileFiltersOpen })),
}))
