// Copy nguyên logic từ frontend (cũ)/src/hooks/useBrandPermission.js — chỉ đổi
// nguồn dữ liệu từ BrandContext (Context API) sang useBrandStore (Zustand), vì
// publicast-frontend dùng Zustand cho state global thay vì Context. Hành vi/shape
// dữ liệu activeBrand giữ nguyên y hệt bản gốc.
import { useBrandStore } from "@/store/useBrandStore"

export function useBrandPermission() {
  const activeBrand = useBrandStore((state) => state.activeBrand)

  const hasPermission = (permissionKey) => {
    if (!activeBrand) return false

    // Owner and Admin have full access to all features
    if (
      activeBrand.isOwner ||
      activeBrand.userRole === "OWNER" ||
      activeBrand.userRole === "ADMIN"
    ) {
      return true
    }

    // Check specific permission in the userPermissions array
    const permissions = activeBrand.userPermissions || []
    return permissions.some(
      (p) =>
        (p.key === permissionKey || p.permissionKey === permissionKey) &&
        p.isAllowed === true
    )
  }

  return { hasPermission }
}
