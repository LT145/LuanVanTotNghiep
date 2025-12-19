import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // ✅ Kiểm tra đăng nhập
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const userId = session.user.id as string

    // ✅ Lấy danh sách đơn hàng + sản phẩm chi tiết
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                category: {
                  select: { id: true, name: true },
                },
                images: {
                  where: { isMain: true },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    })

    // ✅ Format dữ liệu trả về
    const formatted = orders.map((o) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      shippingFee: o.shippingFee,
      status: o.status,
      paymentMethod: o.paymentMethod,
      shippingMethod: o.shippingMethod,
      shippingAddress: o.shippingAddress,
      province: o.province,
      ward: o.ward,
      recipientName: o.recipientName,
      recipientPhone: o.recipientPhone,
      createdAt: o.createdAt,
      note: o.note,
      items: o.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        price: i.price,
        color: i.color,
        size: i.size,
        product: {
          id: i.product.id,
          name: i.product.name,
          basePrice: i.product.basePrice,
          image: i.product.images[0]?.url || null,
          category: i.product.category,
        },
      })),
    }))

    return NextResponse.json({ ok: true, orders: formatted })
  } catch (e: any) {
    console.error("GET /api/order/user error:", e)
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}
