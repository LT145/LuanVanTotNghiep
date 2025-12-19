import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ success: false, message: "Missing slug" }, { status: 400 })
    }

    const now = new Date()

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: true,
        variantColors: {
          include: {
            images: true,
            sizes: true, // có id/size/price/stock
          },
        },
        category: true,

        // ✅ thêm promotions đang hiệu lực
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
            // nếu muốn chặn DISABLED:
            // status: { not: "DISABLED" },
          },
          include: {
            sizes: true, // PromotionSize: { sizeId, price }
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("❌ GET /api/products/[slug] error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
