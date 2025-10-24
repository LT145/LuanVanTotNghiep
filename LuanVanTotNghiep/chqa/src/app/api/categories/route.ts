import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📦 Lấy toàn bộ đối tượng (main category)
export async function GET() {
  try {
    const mains = await prisma.mainCategory.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: mains,
    });
  } catch (err) {
    console.error("❌ Lỗi lấy đối tượng:", err);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// ➕ Thêm đối tượng mới
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Thiếu tên đối tượng" }, { status: 400 });
    }

    const exist = await prisma.mainCategory.findUnique({ where: { name } });
    if (exist) {
      return NextResponse.json({ success: false, message: "Đối tượng đã tồn tại" }, { status: 409 });
    }

    const newMain = await prisma.mainCategory.create({
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, data: newMain });
  } catch (err) {
    console.error("❌ Lỗi thêm đối tượng:", err);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
