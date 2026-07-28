import { create } from "zustand"
import { brandService } from "@/services/brandService"

export const useBrandStore = create((set, get) => ({
  brands: [],
  activeBrand: null,

  setActiveBrand: (brand) => set({ activeBrand: brand }),
  setBrands: (brands) => set({ brands, activeBrand: get().activeBrand || brands[0] || null }),

  fetchBrands: async () => {
    try {
      const brands = await brandService.getBrands()
      const currentActive = get().activeBrand
      const activeBrand = currentActive || (brands.length > 0 ? brands[0] : null)
      set({ brands, activeBrand })
    } catch {
      // Keep existing state on error
    }
  },
}))
