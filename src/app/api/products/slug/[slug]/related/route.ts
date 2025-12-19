import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Lấy sản phẩm hiện tại theo slug
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, data: [] });
    }

    // Lấy sản phẩm tương tự theo category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        slug: { not: slug },        // loại sản phẩm hiện tại
        isActive: true,
      },
      include: {
        images: true,
        variantColors: {
          include: { images: true },
        },
      },
      take: 4,
    });

    return NextResponse.json({ success: true, data: related });
  } catch (error) {
    console.error("Related Products Error:", error);
    return NextResponse.json({ success: false, data: [] });
  }
}
