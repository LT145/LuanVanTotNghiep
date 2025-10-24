import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📦 Lấy danh mục theo mainCategoryId
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const mainId = parseInt(params.id);
    if (isNaN(mainId)) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ" }, { status: 400 });
    }

    const subs = await prisma.subCategory.findMany({
      where: { mainCategoryId: mainId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, data: subs });
  } catch (err) {
    console.error("❌ Lỗi lấy danh mục:", err);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}

// ➕ Thêm danh mục mới
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const mainId = parseInt(params.id);
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Thiếu tên danh mục" }, { status: 400 });
    }

    const mainExists = await prisma.mainCategory.findUnique({ where: { id: mainId } });
    if (!mainExists) {
      return NextResponse.json({ success: false, message: "Không tìm thấy đối tượng cha" }, { status: 404 });
    }

    const exist = await prisma.subCategory.findFirst({
      where: { name: name.trim(), mainCategoryId: mainId },
    });
    if (exist) {
      return NextResponse.json({ success: false, message: "Danh mục đã tồn tại" }, { status: 409 });
    }

    const newSub = await prisma.subCategory.create({
      data: { name: name.trim(), mainCategoryId: mainId },
    });

    return NextResponse.json({ success: true, data: newSub });
  } catch (err) {
    console.error("❌ Lỗi thêm danh mục:", err);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ" }, { status: 500 });
  }
}
