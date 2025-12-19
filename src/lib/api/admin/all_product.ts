import axios from "axios"

export async function fetchAdminProducts() {
  const res = await axios.get("/api/admin/products")
  return res.data
}
    