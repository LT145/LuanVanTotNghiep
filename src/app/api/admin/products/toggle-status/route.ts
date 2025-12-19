// app/api/admin/products/toggle-status/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { productId } = await req.json()

    if (!productId)
      return NextResponse.json({ success: false, message: "Missing productId" })

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { isActive: true },
    })

    if (!product)
      return NextResponse.json({ success: false, message: "Không tìm thấy sản phẩm" })

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
    })

    return NextResponse.json({
      success: true,
      message: updated.isActive ? "Đã mở khóa sản phẩm" : "Đã khóa sản phẩm",
      isActive: updated.isActive,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, message: "Lỗi server" })
  }
}
