
import axios from "axios";

export const getAllCategories = async() => {
    try {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`);
        return res.data
    } catch (err) {
        console.error("❌ Lỗi khi lấy danh mục:", err)
    }
}



