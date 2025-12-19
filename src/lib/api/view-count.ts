import axios from "axios";

export const increaseViewBySlug = async (slug: string) => {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/slug/${slug}/view-count`
    );

    return res.data;
  } catch (error) {
    console.error("❌ Lỗi tăng view count:", error);
  }
};
