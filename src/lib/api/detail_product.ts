import axios from "axios";

export const getProductBySlug = async (slug: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/slug/${slug}`,
      { validateStatus: () => true } // 👈 CHO PHÉP axios không throw lỗi
    );

    return res.data; // luôn trả về JSON kể cả khi 404
  } catch (err) {
    console.error("❌ Axios error getProductBySlug:", err);
    return { success: false, message: "Network error" };
  }
};
