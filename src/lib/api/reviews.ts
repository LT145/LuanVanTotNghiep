import axios from "axios"

// ⭐ GET reviews theo productId + optional rating
export const getReviews = async (productId: string, rating?: number) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`, {
      params: {
        productId,
        rating: rating || undefined,
      },
    })
    return res.data
  } catch (err) {
    console.error("getReviews error:", err)
    return { success: false, data: [] }
  }
}

// ⭐ POST tạo review
export const createReview = async ({
  productId,
  rating,
  content,
  images = [],
}: {
  productId: string
  rating: number
  content: string
  images?: string[]
}) => {
  try {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`, {
      productId,
      rating,
      content,
      images,
    })

    return res.data
  } catch (err) {
    console.error("createReview error:", err)
    return { success: false }
  }
}
