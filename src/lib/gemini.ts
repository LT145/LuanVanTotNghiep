import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function buildGeminiKeywords(name: string, description: string) {
  try {
    const prompt = `
    Tạo keyword SEO cho sản phẩm dưới đây:

    Tên sản phẩm: ${name}
    Mô tả: ${description}

    YÊU CẦU:
    - Trả về dạng JSON array
    - Chỉ gồm keyword dạng chữ thường, không dấu
    - Không viết mô tả thừa, không giải thích
    - Tối đa 20 keyword
    - Ví dụ output hợp lệ:
    ["ao thun nam","ao basic","streetwear"]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Hoặc gemini-1.5-flash
      contents: prompt,
      // 🔥 1. Cấu hình bắt buộc trả về JSON
      config: {
        responseMimeType: "application/json",
      },
    });

    // Lưu ý: Tùy version SDK mà dùng response.text() (hàm) hoặc response.text (biến)
    // Nếu code cũ của bạn là response.text chạy được thì giữ nguyên,
    // nếu không hãy thử response.candidates[0].content.parts[0].text
    let text = response.text || "[]"; 

    // 🔥 2. VỆ SINH CHUỖI TRƯỚC KHI PARSE (Quan trọng)
    // Loại bỏ ```json, ``` và khoảng trắng thừa
    if (typeof text === 'string') {
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) return parsed;

    return [];
  } catch (error) {
    console.error("❌ Gemini Keyword Error:", error);
    // Trả về mảng rỗng để không làm crash app
    return [];
  }
}