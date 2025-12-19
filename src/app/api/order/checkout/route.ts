import { NextResponse } from "next/server"
import { PrismaClient, PaymentMethod, OrderStatus, ShippingMethod } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

type CheckoutPayload = {
  paymentMethod: "ZALOPAY" | "COD"
  amount: number
  paymentInfo?: {
    app_trans_id?: string
    zp_trans_id?: string
  }
  shipping: {
    fullName: string
    phone: string
    addressLine: string
    wardName?: string
    provinceName?: string
    note?: string
    method: "standard" | "express"
    shippingCost: number
  }
}

export async function POST(req: Request) {
  try {
    // 1️⃣ Xác thực user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
    }
    const userId = session.user.id as string

    // 2️⃣ Đọc dữ liệu client gửi lên
    const body = (await req.json()) as CheckoutPayload

    // 3️⃣ Lấy cart và các item
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ ok: false, error: "CART_EMPTY" }, { status: 400 })
    }

    // 4️⃣ Tính toán subtotal + phí ship + tổng tiền
    const subtotal = cart.items.reduce((s, it) => s + it.price * it.quantity, 0)
    const shippingFee = Math.max(0, Math.floor(body.shipping.shippingCost || 0))
    const computedTotal = subtotal + shippingFee

    if (Math.abs(computedTotal - body.amount) > 1) {
      return NextResponse.json({ ok: false, error: "AMOUNT_MISMATCH" }, { status: 400 })
    }

// 5️⃣ Tạo đơn hàng trong transaction
const order = await prisma.$transaction(async (tx) => {
  // ❌ Bỏ qua kiểm tra và trừ tồn kho

  // 5.2 Tạo đơn hàng chính
const newOrder = await tx.order.create({
  data: {
    userId,
    totalAmount: computedTotal,
    shippingFee,

    // 🎯 Nếu ZALOPAY → coi như đã thanh toán thành công
    status: body.paymentMethod === "ZALOPAY" ? "PROCESSING" : "PENDING",
    paymentMethod: body.paymentMethod as PaymentMethod,
    paymentStatus: body.paymentMethod === "ZALOPAY" ? "PAID" : "PENDING",

    shippingMethod:
      body.shipping.method === "express"
        ? ShippingMethod.EXPRESS
        : ShippingMethod.STANDARD,

    recipientName: body.shipping.fullName || "Khách hàng",
    recipientPhone: body.shipping.phone || "0000000000",
    shippingAddress: body.shipping.addressLine,
    province: body.shipping.provinceName || "",
    ward: body.shipping.wardName || "",
    note: body.shipping.note,

    items: {
      create: cart.items.map((it) => ({
        productId: it.productId,
        color: it.color || null,
        size: it.size || null,
        quantity: it.quantity,
        price: it.price,
      })),
    },
  },
})


  // 5.3 Xoá giỏ hàng sau khi đặt
  await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

  return newOrder
})

    return NextResponse.json({ ok: true, orderId: order.id })
  } catch (e: any) {
    console.error(e)
    if (typeof e.message === "string" && e.message.startsWith("OUT_OF_STOCK")) {
      return NextResponse.json({ ok: false, error: "OUT_OF_STOCK", detail: e.message }, { status: 409 })
    }
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
