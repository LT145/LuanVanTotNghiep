import axios from "axios";

export const saveRecentlyViewed = async (slug: string, userId: string) => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/slug/${slug}/recently-viewed`,
      { userId }
    );

    return res.data;
  } catch (error) {
    console.error("❌ Lỗi recently viewed:", error);
  }
};
