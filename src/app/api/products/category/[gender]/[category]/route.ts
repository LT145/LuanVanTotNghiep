import { NextResponse } from "next/server"
import { PrismaClient, Gender } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ gender: string; category: string }> },
) {
  try {
    const { gender, category } = await params

    if (!gender || !category) {
      return NextResponse.json({ success: false, message: "Thiếu params" }, { status: 400 })
    }

    const genderEnum = gender.toUpperCase() as Gender
    if (!["MALE", "FEMALE", "UNISEX"].includes(genderEnum)) {
      return NextResponse.json({ success: false, message: "Gender không hợp lệ" }, { status: 400 })
    }

    const categoryData = await prisma.category.findFirst({
      where: { slug: category, gender: genderEnum },
    })

    if (!categoryData) {
      return NextResponse.json({ success: false, message: "Không tìm thấy danh mục" })
    }

    const now = new Date()

    const products = await prisma.product.findMany({
      where: { categoryId: categoryData.id, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        categoryId: true,

        images: {
          orderBy: { createdAt: "asc" },
          select: { url: true, isMain: true },
        },

        variantColors: {
          select: {
            color: true,
            sizes: { select: { size: true, stock: true } },
          },
        },

        // ✅ LẤY PROMOTION ĐANG HIỆU LỰC + price theo size
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
            // nếu bạn muốn chặn DISABLED:
            // status: { not: "DISABLED" },
          },
          select: {
            id: true,
            sizes: {
              select: {
                price: true, // ✅ giá KM theo size
              },
            },
          },
        },
      },
    })

    const formatted = products.map((p) => {
      const promoPrices = p.promotions.flatMap((pm) => pm.sizes.map((s) => s.price))
      const minPromoPrice = promoPrices.length ? Math.min(...promoPrices) : null

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: p.basePrice,

        minPromoPrice, // ✅ thêm field này cho FE

        images: {
          main: p.images.find((i) => i.isMain)?.url || null,
          preview:
            p.images.find((i) => !i.isMain)?.url || (p.images.length > 1 ? p.images[1].url : null),
        },

        variantColors: p.variantColors,
      }
    })

    return NextResponse.json({
      success: true,
      category: categoryData,
      products: formatted,
    })
  } catch (error) {
    console.error("API ERROR:", error)
    return NextResponse.json(
      { success: false, message: "Server error", error: String(error) },
      { status: 500 },
    )
  }
}
