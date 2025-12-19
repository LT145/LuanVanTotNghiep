import axios from "axios"

export const getProductsByCategory = async(gender: string, category: string) => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/category/${gender}/${category}`)
        return res.data
    } catch (err) {
        console.error("❌ Lỗi khi lấy sản phẩm từ danh mục:", err)
    }
}



