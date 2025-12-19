// app/api/returns/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

type CreateReturnBody = {
  orderId: string
  type: "EXCHANGE" | "RETURN" | "REFUND"
  reason: string
  note?: string
  mediaUrls?: string[]
  items: { orderItemId: string; quantity: number }[]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ success: true, data: [] })
    }

    const data = await prisma.returnRequest.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            totalAmount: true,
            recipientName: true,
            recipientPhone: true,
            shippingAddress: true,
            ward: true,
            province: true,
          },
        },
        items: {
          include: {
            orderItem: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: { where: { isMain: true }, select: { url: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error("GET /api/returns error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = (await req.json()) as CreateReturnBody

    if (!body?.orderId) {
      return NextResponse.json(
        { success: false, message: "Missing orderId" },
        { status: 400 }
      )
    }
    if (!body?.type) {
      return NextResponse.json(
        { success: false, message: "Missing type" },
        { status: 400 }
      )
    }
    if (!body?.reason?.trim()) {
      return NextResponse.json(
        { success: false, message: "Missing reason" },
        { status: 400 }
      )
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing items" },
        { status: 400 }
      )
    }

    // Validate order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: body.orderId, userId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    // Validate items belong to that order + quantity
    const orderItemIds = new Set(order.items.map((i) => i.id))
    for (const it of body.items) {
      if (!it?.orderItemId || !orderItemIds.has(it.orderItemId)) {
        return NextResponse.json(
          { success: false, message: "Invalid orderItemId" },
          { status: 400 }
        )
      }
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: "Invalid quantity" },
          { status: 400 }
        )
      }

      const oi = order.items.find((x) => x.id === it.orderItemId)
      if (!oi) continue
      if (it.quantity > oi.quantity) {
        return NextResponse.json(
          { success: false, message: "Quantity exceeds ordered quantity" },
          { status: 400 }
        )
      }
    }

    // Create ReturnRequest + ReturnItem(s) in transaction
    const created = await prisma.$transaction(async (tx) => {
      const rr = await tx.returnRequest.create({
        data: {
          userId,
          orderId: body.orderId,
          type: body.type,
          status: "PENDING",
          reason: body.reason.trim(),
          note: body.note?.trim() || null,
          mediaUrls: Array.isArray(body.mediaUrls) ? body.mediaUrls : [],
          isActive: true,
        },
      })

      await tx.returnItem.createMany({
        data: body.items.map((it) => ({
          returnId: rr.id, // ✅ đúng field theo schema: returnId
          orderItemId: it.orderItemId,
          quantity: it.quantity,
        })),
      })

      return rr
    })

    return NextResponse.json({ success: true, data: created })
  } catch (e) {
    console.error("POST /api/returns error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
