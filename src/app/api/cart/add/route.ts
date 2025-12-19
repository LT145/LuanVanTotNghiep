import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { productId, color, size, quantity, price } = body

    // ✅ Lấy hoặc tạo giỏ hàng cho user
    let cart = await prisma.cart.findUnique({ where: { userId: session.user.id } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: session.user.id } })
    }

    // ✅ Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, color, size },
    })

    if (existing) {
      // cập nhật số lượng
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, color, size, quantity, price },
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
