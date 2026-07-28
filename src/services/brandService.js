import api from "./api"

export const brandService = {
  async getBrands() {
    const res = await api.get("/brands")
    return res.data.data || []
  },
}
