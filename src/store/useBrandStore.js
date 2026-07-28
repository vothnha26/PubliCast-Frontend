import { create } from "zustand"

// PLACEHOLDER: publicast-frontend chưa nối API /brands thật (chưa có BrandContext
// như frontend cũ). Store này giữ đúng SHAPE dữ liệu activeBrand mà AccessGuard /
// useBrandPermission kỳ vọng (isOwner, userRole, userPermissions, currentPlan.name),
// để khi nối API /brands thật sau này chỉ cần sửa action bên trong, không phải sửa
// lại AccessGuard hay bất kỳ component nào đang gọi useBrandPermission().
//
// TODO(brand): thay setActiveBrand mock này bằng action gọi GET /brands thật
// (xem PubliCast/frontend/src/context/BrandContext.jsx làm mẫu hành vi gốc).
export const useBrandStore = create((set) => ({
  brands: [],
  activeBrand: null,

  setActiveBrand: (brand) => set({ activeBrand: brand }),
  setBrands: (brands) => set({ brands }),
}))
