import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 🔍 Lấy tất cả đơn hàng
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: { id: true },
        },
      },
    })

    // ✂️ Trả về gọn đúng các trường cần
    const simplified = orders.map((o) => ({
      id: o.id,
      recipientName: o.recipientName,
      createdAt: o.createdAt,
      totalAmount: o.totalAmount,
      status: o.status,
      itemsCount: o.items.length, // chỉ số lượng sản phẩm
    }))

    return NextResponse.json({ ok: true, orders: simplified })
  } catch (err) {
    console.error("GET /api/order error:", err)
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 })
  }
}
