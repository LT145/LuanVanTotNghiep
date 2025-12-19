// app/api/admin/returns/[id]/received/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    const adminId = session?.user?.id

    if (!adminId || (role !== "ADMIN" && role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await req.json().catch(() => ({} as any))
    const adminNote = (body?.adminNote as string | undefined)?.trim()

    const rr = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        items: { include: { orderItem: true } },
      },
    })

    if (!rr || !rr.isActive) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      )
    }

    // Chỉ nhận hàng khi đã được duyệt
    if (rr.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, message: "Return must be APPROVED before RECEIVED" },
        { status: 400 }
      )
    }

    // ✅ Cộng tồn kho theo (productId + color + size) dựa vào OrderItem
    // Demo: updateMany vì không chắc unique variant size trong DB của bạn
    await prisma.$transaction(async (tx) => {
      for (const it of rr.items) {
        const oi = it.orderItem
        const color = oi.color ?? ""
        const size = oi.size ?? ""

        if (!oi.productId || !color || !size) continue

        await tx.productVariantSize.updateMany({
          where: {
            size,
            colorVariant: {
              productId: oi.productId,
              color,
            },
          },
          data: {
            stock: { increment: it.quantity },
          },
        })
      }

      const stamp = `Received by ${adminId} at ${new Date().toISOString()}`
      await tx.returnRequest.update({
        where: { id },
        data: {
          status: "RECEIVED",
          adminNote: adminNote ? `${stamp}\n${adminNote}` : stamp,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("POST /api/admin/returns/[id]/received error:", e)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
