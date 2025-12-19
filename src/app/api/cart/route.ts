import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

// 🧠 GET - Lấy giỏ hàng của user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ items: [] }) // nếu chưa đăng nhập, trả về trống

  const cart = await prisma.cart.findFirst({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isMain: true } } },
          },
        },
      },
    },
  })

  return NextResponse.json(cart || { items: [] })
}

// ➕ POST - Thêm sản phẩm vào giỏ
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  }

  const { productId, color, size, quantity, price } = await req.json()

  let cart = await prisma.cart.findFirst({ where: { userId: session.user.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.user.id } })
  }

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, color, size },
  })

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    })
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, color, size, quantity, price },
    })
  }

  return NextResponse.json({ success: true })
}

// ❌ DELETE - Xóa item
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

  const { itemId } = await req.json()
  await prisma.cartItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}

// 🧹 DELETE ALL - Dọn giỏ
export async function PATCH() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

  await prisma.cart.deleteMany({ where: { userId: session.user.id } })
  return NextResponse.json({ success: true })
}
// 📝 Cập nhật số lượng sản phẩm trong giỏ
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })

  const { itemId, quantity } = await req.json()

  try {
    const existing = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: session.user.id } }, // ✅ kiểm tra quyền sở hữu giỏ
    })

    if (!existing) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại trong giỏ hàng" }, { status: 404 })
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error("❌ Lỗi PUT giỏ hàng:", err)
    return NextResponse.json({ error: "Lỗi khi cập nhật số lượng" }, { status: 500 })
  }
}
