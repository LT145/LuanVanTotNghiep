import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || query.trim() === "") {
      return NextResponse.json({ success: true, data: [] });
    }

    const prompt = `
      Người dùng đang tìm: "${query}".
      Hãy trả về đúng 5 từ khóa tìm kiếm liên quan.
      Trả lời duy nhất bằng JSON array, ví dụ:
      ["áo thun nam","áo phông cotton","áo basic nam"]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Lấy text từ Gemini
    let raw = response.text ?? "";

    // ==============================
    // 1) LOẠI BỎ MỌI PREFIX LỖI
    // ==============================
    raw = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^json/gi, "")
      .replace(/^JSON/gi, "")
      .trim();

    // ==============================
    // 2) CHỈ GIỮ LẠI PHẦN MẢNG JSON
    // ==============================
    // Nếu Gemini trả kiểu:
    // json
    // ["abc","xyz"]
    //
    // hoặc TEXT kèm ký tự thừa — regex sẽ lấy đúng phần [ ... ]
    const jsonMatch = raw.match(/\[[\s\S]*\]/);

    if (jsonMatch) raw = jsonMatch[0];

    // ==============================
    // 3) PARSE JSON AN TOÀN
    // ==============================
    let keywords: string[] = [];

    try {
      keywords = JSON.parse(raw);
    } catch {
      // fallback nếu AI trả dạng: a, b, c
      keywords = raw
        .replace(/[\[\]]/g, "")
        .split(",")
        .map((s) => s.replace(/"/g, "").trim())
        .filter((s) => s.length > 0);
    }

    // ==============================
    // 4) TRẢ VỀ TỐI ĐA 5 KEYWORDS
    // ==============================
    return NextResponse.json({
      success: true,
      data: keywords.slice(0, 5),
    });
  } catch (error) {
    console.error("AI Keyword Error:", error);
    return NextResponse.json({
      success: false,
      data: [],
    });
  }
}
    