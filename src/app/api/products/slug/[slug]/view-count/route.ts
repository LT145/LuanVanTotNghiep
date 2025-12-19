import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {

  try {
    // Lấy sản phẩm theo slug
      const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    // Tăng viewCount
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Lỗi tăng view:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tăng view" },
      { status: 500 }
    );
  }
}
