import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { userId } = await req.json()

    if (!userId || !slug) {
      return NextResponse.json(
        { success: false, message: "Missing userId or slug" },
        { status: 400 }
      )
    }

    // 🔎 Find productId by slug
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }

    const productId = product.id

    // 🔁 Check existing
    const existing = await prisma.recentlyViewed.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    if (existing) {
      const updated = await prisma.recentlyViewed.update({
        where: { userId_productId: { userId, productId } },
        data: { viewedAt: new Date() },
      })

      return NextResponse.json({ success: true, data: updated })
    }

    // 🔢 Limit = 5
    const count = await prisma.recentlyViewed.count({
      where: { userId },
    })

    if (count >= 5) {
      const oldest = await prisma.recentlyViewed.findFirst({
        where: { userId },
        orderBy: { viewedAt: "asc" },
      })

      if (oldest) {
        await prisma.recentlyViewed.delete({
          where: { id: oldest.id },
        })
      }
    }

    const created = await prisma.recentlyViewed.create({
      data: { userId, productId },
    })

    return NextResponse.json({ success: true, data: created })
  } catch (error) {
    console.error("❌ POST recently-viewed error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save recently viewed" },
      { status: 500 }
    )
  }
}
