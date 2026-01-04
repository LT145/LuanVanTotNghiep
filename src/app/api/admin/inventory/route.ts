import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // <- đổi nếu bạn đang dùng path khác

function pickMainImage(product: any) {
  // ưu tiên ảnh main của product, không có thì lấy ảnh đầu tiên
  const main = product.images?.find((x: any) => x.isMain)?.url
  return main || product.images?.[0]?.url || "/placeholder.svg"
}

export async function GET() {
  try {
    const storeSetting = await prisma.storeSetting.findFirst()
    const lowStockThreshold = storeSetting?.lowStockThreshold ?? 5

    const items = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
        variantColors: {
          orderBy: { createdAt: "asc" },
          include: {
            sizes: { orderBy: { size: "asc" } },
          },
        },
      },
    })

    const data = items.map((p) => ({
      id: p.id,
      name: p.name,
      gender: p.category?.gender || "UNISEX",
      category: p.category?.name || "Chưa phân loại",
      image: pickMainImage(p),
      basePrice: p.basePrice,
      variants: p.variantColors.map((v) => ({
        id: v.id,
        color: v.color,
        sizes: v.sizes.map((s) => ({
          id: s.id,
          size: s.size,
          price: s.price,
          stock: s.stock,
        })),
      })),
    }))

    return NextResponse.json({ ok: true, data, meta: { lowStockThreshold } })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json(
      { ok: false, message: e?.message || "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const action = body?.action as "ADD" | "SET"
    const colorVariantId = body?.colorVariantId as string
    const sizeIds = (body?.sizeIds || []) as string[]
    const quantity = body?.quantity as number | undefined
    const setStock = body?.setStock as number | undefined

    if (!action || !colorVariantId || !Array.isArray(sizeIds) || sizeIds.length === 0) {
      return NextResponse.json({ ok: false, message: "Thiếu dữ liệu" }, { status: 400 })
    }

    if (action === "ADD") {
      if (!Number.isFinite(quantity) || (quantity as number) <= 0) {
        return NextResponse.json({ ok: false, message: "Số lượng nhập không hợp lệ" }, { status: 400 })
      }

      // đảm bảo size thuộc đúng colorVariantId
      await prisma.productVariantSize.updateMany({
        where: {
          id: { in: sizeIds },
          colorVariantId,
        },
        data: {
          stock: { increment: quantity as number },
        },
      })
    }

    if (action === "SET") {
      if (!Number.isFinite(setStock) || (setStock as number) < 0) {
        return NextResponse.json({ ok: false, message: "Tồn kho mới không hợp lệ" }, { status: 400 })
      }

      await prisma.productVariantSize.updateMany({
        where: {
          id: { in: sizeIds },
          colorVariantId,
        },
        data: {
          stock: setStock as number,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json(
      { ok: false, message: e?.message || "Server error" },
      { status: 500 }
    )
  }
}
