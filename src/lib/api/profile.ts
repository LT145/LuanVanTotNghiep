import axios from "axios";

export const getUserProfile = async (id: string) => {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${id}`
    );

    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi load profile user:", error);
  }
};
