import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

function calcMinPromoPrice(product: any) {
  const prices: number[] =
    product?.promotions
      ?.flatMap((pm: any) => (pm?.sizes || []).map((s: any) => Number(s.price)))
      ?.filter((x: any) => Number.isFinite(x) && x > 0) || []

  return prices.length ? Math.min(...prices) : null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ success: true, data: [] })
    }

    const now = new Date()

    const viewed = await prisma.recentlyViewed.findMany({
      where: {
        userId: session.user.id,
        product: { isActive: true },
      },
      orderBy: { viewedAt: "desc" },
      take: 8,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            basePrice: true,
            images: true,
            category: {
              select: {
                slug: true,
                gender: true, // MALE, FEMALE, UNISEX
              },
            },

            // ✅ lấy các KM đang hiệu lực để tính min
            promotions: {
              where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
              },
              select: {
                id: true,
                sizes: {
                  select: {
                    price: true, // PromotionSize.price
                  },
                },
              },
            },
          },
        },
      },
    })

    const data = viewed
      .map((item) => item.product)
      .filter(Boolean)
      .map((p: any) => {
        const minPromoPrice = calcMinPromoPrice(p)
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          basePrice: p.basePrice,
          images: p.images,
          category: p.category,

          // ✅ fields mới
          minPromoPrice,
          hasPromotion: minPromoPrice !== null && minPromoPrice < Number(p.basePrice || 0),
        }
      })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("❌ GET /api/products/recently-viewed error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
